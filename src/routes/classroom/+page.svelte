<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { supabase } from '$lib/supabaseClient';

  /** @type {{ data: { sections: any[], hasPaid: boolean, userId: string | null } }} */
  let { data } = $props();

  // Reactive state (Svelte 5 runes)
  let sidebarOpen = $state(false);
  let searchQuery = $state('');
  let selectedLesson = $state('Ketik menu ☰ untuk melihat senarai video pembelajaran.');
  let currentVideo = $state('');
  let selectedItem = $state(null); // full item object — carries id/watched/resumeSeconds

  // Element refs, needed for "click outside sidebar to close"
  let sidebarEl = $state(null);
  let menuBtnEl = $state(null);

  // --- Progress tracking state ---
  // YouTube: driven by the IFrame Player API (postMessage under the hood),
  // which exposes currentTime/duration — real resume + watched detection.
  // Google Drive's /preview iframe has no equivalent public API (cross-origin,
  // no postMessage contract Google exposes), so Drive items fall back to a
  // manual "mark as watched" button — see markDriveWatched() below.
  let ytPlayer = null;
  let ytApiReady = $state(false);
  let progressSaveInterval = null;

  onMount(() => {
    function handleOutsideClick(e) {
      // menuBtnEl now lives inside sidebarEl, so sidebarEl.contains(e.target)
      // already covers clicks on the button too — the explicit check is
      // just a harmless belt-and-suspenders.
      if (sidebarEl && !sidebarEl.contains(e.target) && e.target !== menuBtnEl) {
        sidebarOpen = false;
      }
    }
    document.addEventListener('click', handleOutsideClick);

    // Deep link from the home page's "Sambung Belajar" card — resume the
    // exact lesson instead of just landing on the classroom listing.
    // Only auto-selects items the server already deemed unlocked/playable;
    // a stale or tampered ?item= for a locked/missing lesson is a silent no-op.
    const requestedItemId = page.url.searchParams.get('item');
    if (requestedItemId) {
      const requestedItem = data.sections
        .flatMap((section) => section.items)
        .find((item) => item.id === requestedItemId && item.video && !item.locked);
      if (requestedItem) selectLesson(requestedItem);
    }

    // Load the YouTube IFrame API once per page load.
    if (window.YT && window.YT.Player) {
      ytApiReady = true;
    } else {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        ytApiReady = true;
      };
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      clearInterval(progressSaveInterval);
      ytPlayer?.destroy?.();
    };
  });

  // Recomputes automatically whenever `data.sections` or `searchQuery` change.
  // Sections/items now come from the server load (already filtered/locked,
  // and merged with watched/resumeSeconds), not from a public JSON file
  // fetched client-side.
  let filteredSections = $derived(
    data.sections.map((section) => {
      const filterText = searchQuery.toLowerCase();
      const titleMatches = section.title.toLowerCase().includes(filterText);

      const items = section.items.map((item) => ({
        ...item,
        visible: titleMatches || item.label.toLowerCase().includes(filterText)
      }));

      const anySectionItemVisible = items.some((i) => i.visible);

      return {
        ...section,
        items,
        anySectionItemVisible,
        forceOpen: anySectionItemVisible && filterText.length > 0
      };
    })
  );

  function isYouTube(url) {
    return !!url && url.includes('youtube.com/embed/');
  }

  function extractYouTubeId(embedUrl) {
    const match = embedUrl.match(/embed\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  }

  function selectLesson(item) {
    if (item.locked) {
      // Send them to the payment landing page instead of doing nothing.
      window.location.href = '/pay_landing';
      return;
    }
    if (!item.video) return; // "Akan Datang" items aren't clickable

    // Tear down the previous player before switching lessons. The #key
    // block around the player container (in the markup) also forces a
    // fresh DOM node per lesson, so there's no leftover element for the
    // old player to be confused about.
    clearInterval(progressSaveInterval);
    ytPlayer?.destroy?.();
    ytPlayer = null;

    selectedLesson = item.label;
    selectedItem = item;
    currentVideo = item.video; // only used for isYouTube()/Drive branching + display
    sidebarOpen = false; // auto-hide panel after picking a lesson
  }

  // Attaches a YT.Player to a plain <div id="yt-player-frame"> once it's in
  // the DOM and the API script has loaded. Deliberately targets a *div*,
  // never an <iframe> Svelte also renders reactively — YT.Player replaces
  // whatever element it's given with its own iframe under the hood, and if
  // that element is one Svelte still thinks it owns (e.g. an iframe with a
  // reactive src binding), Svelte's next DOM patch throws trying to update
  // a node that's no longer the one it created. That's what was breaking
  // every click after the first video: the thrown error inside this effect
  // was silently killing reactivity for the rest of the component.
  $effect(() => {
    if (!selectedItem || !ytApiReady || !isYouTube(currentVideo)) return;

    const videoId = extractYouTubeId(currentVideo);
    if (!videoId) return;

    const el = document.getElementById('yt-player-frame');
    if (!el) return;

    const thisItem = selectedItem; // capture for the closures below

    ytPlayer = new window.YT.Player('yt-player-frame', {
      videoId,
      events: {
        onReady: (e) => {
          if (thisItem.resumeSeconds > 5) {
            e.target.seekTo(thisItem.resumeSeconds, true);
          }
        },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            clearInterval(progressSaveInterval);
            progressSaveInterval = setInterval(() => saveYouTubeProgress(thisItem), 10000);
          } else {
            clearInterval(progressSaveInterval);
            if (e.data === window.YT.PlayerState.PAUSED) saveYouTubeProgress(thisItem);
            if (e.data === window.YT.PlayerState.ENDED) saveYouTubeProgress(thisItem, true);
          }
        }
      }
    });
  });

  async function saveYouTubeProgress(item, forceWatched = false) {
    if (!ytPlayer?.getCurrentTime || !data.userId) return;
    const current = ytPlayer.getCurrentTime();
    const duration = ytPlayer.getDuration?.() ?? 0;
    const watched = forceWatched || (duration > 0 && current / duration >= 0.9);
    await persistProgress(
      item.id,
      Math.floor(current),
      watched,
      duration > 0 ? Math.floor(duration) : null
    );
    if (watched && selectedItem?.id === item.id) {
      selectedItem = { ...selectedItem, watched: true };
    }
  }

  async function markDriveWatched() {
    if (!selectedItem || !data.userId) return;
    // No duration available for Drive — omit it so an existing value (if
    // any) isn't clobbered, and the resume concept doesn't apply here.
    await persistProgress(selectedItem.id, 0, true, null);
    selectedItem = { ...selectedItem, watched: true };
  }

  async function persistProgress(itemId, resumeSeconds, watched, durationSeconds = null) {
    const payload = {
      user_id: data.userId,
      item_id: itemId,
      resume_seconds: resumeSeconds,
      watched,
      watched_at: watched ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };
    // Only include duration_seconds when we actually know it, so an upsert
    // from a source that doesn't know duration (e.g. the Drive fallback)
    // doesn't overwrite a previously-recorded value with null.
    if (durationSeconds !== null) payload.duration_seconds = durationSeconds;

    const { error } = await supabase
      .from('video_progress')
      .upsert(payload, { onConflict: 'user_id,item_id' });
    if (error) console.error('Failed to save video progress:', error);
  }

  function toggleSidebar(e) {
    e.stopPropagation();
    sidebarOpen = !sidebarOpen;
  }
</script>

<svelte:head>
  <title>Koleksi Modul-Modul - Akademi Abang Rumah</title>
</svelte:head>

<!-- MAIN CONTAINER -->
<div class="flex flex-1 relative">
  <!-- SYLLABUS SIDEBAR (Hidden everywhere by default) -->
  <aside
    bind:this={sidebarEl}
    class="fixed top-0 left-0 w-64 h-full bg-[#4a7425] text-white z-40 transform transition-all duration-300 ease-in-out shadow-2xl {sidebarOpen
      ? ''
      : '-translate-x-full'}"
  >
    <!-- Toggle tab — lives INSIDE the sidebar and sticks out past its right
         edge, so it slides together with the sidebar instead of staying
         pinned in a fixed spot. Sits directly on <aside>, NOT inside the
         scrollable wrapper below — overflow-y-auto on a container clips
         overflow-x too (per the CSS overflow computation rule), so
         anything positioned to stick out past the edge needs to live
         outside that scroll container, not inside it. -->
    <button
      bind:this={menuBtnEl}
      onclick={toggleSidebar}
      class="absolute top-24 right-0 bottom-10 translate-x-full w-9 h-11 bg-[#4a7425] rounded-r-full shadow-md flex items-center justify-center focus:outline-none"
      aria-label="Toggle menu"
    >
      <span class="text-white text-lg leading-none">☰</span>
    </button>

    <!-- Scrollable content wrapper — overflow-y-auto lives here instead of
         on <aside> itself. -->
    <div class="h-full overflow-y-auto p-4 pt-28">
      {#if !data.hasPaid}
        <a
          href="/pay_landing"
          class="block mb-4 bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-xs text-center hover:bg-white/20 transition"
        >
          🔓 Naik taraf untuk buka semua video
        </a>
      {/if}

      <div class="mb-6">
        <input
          type="text"
          bind:value={searchQuery}
          onclick={(e) => e.stopPropagation()}
          placeholder="Cari topik/video..."
          class="w-full px-3 py-2 text-sm text-black rounded bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-inner"
        />
      </div>

      <div class="space-y-6">
        {#each filteredSections as section}
          {#if section.anySectionItemVisible}
            <details class="lesson-section space-y-2 group" open={section.forceOpen}>
              <summary
                class="lesson-section-title bg-white text-black font-semibold px-3 py-1.5 rounded text-center shadow-sm cursor-pointer list-none select-none outline-none"
              >
                {section.title}
              </summary>
              <ul class="pl-2 space-y-1 text-sm text-slate-200 mt-2">
                {#each section.items as item}
                  {#if item.visible}
                    {#if item.locked}
                      <li
                        onclick={() => selectLesson(item)}
                        class="lesson-item cursor-pointer p-1 rounded flex items-center justify-between text-amber-200 hover:text-white transform transition-all duration-200 hover:translate-y-0.5"
                      >
                        <span>{item.label}</span>
                        <span class="text-xs shrink-0 ml-2">🔒</span>
                      </li>
                    {:else if item.video}
                      <li
                        onclick={() => selectLesson(item)}
                        class="lesson-item cursor-pointer hover:text-white p-1 rounded flex items-center justify-between transform transition-all duration-200 hover:translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm {selectedLesson ===
                        item.label
                          ? 'bg-blue-800 text-white'
                          : ''}"
                      >
                        <span>{item.label}</span>
                        {#if item.watched}
                          <span class="text-xs shrink-0 ml-2 text-emerald-300" title="Sudah ditonton">✔</span>
                        {/if}
                      </li>
                    {:else}
                      <li
                        class="lesson-item lesson-item-disabled p-1 rounded text-slate-400 italic cursor-not-allowed select-none"
                      >
                        {item.label} <span class="text-xs">(Akan Datang)</span>
                      </li>
                    {/if}
                  {/if}
                {/each}
              </ul>
            </details>
          {/if}
        {/each}
      </div>
    </div>
  </aside>

  <!-- MAIN CANVAS -->
  <main class="flex-1 p-4 lg:p-8 bg-gray-50 transition-all duration-300">
    <div class="max-w-4xl mx-auto">
      <!-- Active Lesson Title -->
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left">
        {selectedLesson}
      </h1>

      <!-- Responsive Video Container Player Using HTML iframe -->
      <div class="aspect-video w-full bg-black rounded-lg shadow-inner overflow-hidden">
        {#key selectedItem?.id}
          {#if isYouTube(currentVideo)}
            <!-- YT.Player owns this div entirely — never give it a node
                 Svelte also patches reactively (see the $effect above). -->
            <div id="yt-player-frame" class="w-full h-full"></div>
          {:else}
            <iframe
              class="w-full h-full"
              src={currentVideo}
              title={selectedLesson}
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          {/if}
        {/key}
      </div>

      <!-- Google Drive videos have no playback API to auto-track, so
           watched status is a manual toggle here instead. -->
      {#if selectedItem?.video && !isYouTube(selectedItem.video) && data.userId}
        <div class="mt-3 text-center">
          {#if selectedItem.watched}
            <span class="text-emerald-600 text-sm font-medium">✔ Selesai ditonton</span>
          {:else}
            <button
              onclick={markDriveWatched}
              class="text-sm px-4 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Tandakan sebagai selesai
            </button>
          {/if}
        </div>
      {/if}

      <p class="lg:hidden block sm:hidden text-center text-sm text-gray-500 mb-2 pt-10">
        Tip: Putarkan peranti secara melintang untuk melihat video dengan lebih baik.
      </p>
    </div>
  </main>
</div>