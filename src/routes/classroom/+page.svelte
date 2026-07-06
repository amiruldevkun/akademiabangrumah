<script>
  import { onMount } from 'svelte';

  // Reactive state (Svelte 5 runes)
  let sidebarOpen = $state(false);
  let sections = $state([]);
  let searchQuery = $state('');
  let selectedLesson = $state('Ketik menu ☰ untuk melihat senarai video pembelajaran.');
  let currentVideo = $state('');

  // Element refs, needed for "click outside sidebar to close"
  let sidebarEl = $state(null);
  let menuBtnEl = $state(null);

  onMount(async () => {
    try {
      const response = await fetch('/sidebar-data.json');
      sections = await response.json();
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    }

    function handleOutsideClick(e) {
      if (sidebarEl && !sidebarEl.contains(e.target) && e.target !== menuBtnEl) {
        sidebarOpen = false;
      }
    }
    document.addEventListener('click', handleOutsideClick);

    return () => document.removeEventListener('click', handleOutsideClick);
  });

  // Recomputes automatically whenever `sections` or `searchQuery` change
  let filteredSections = $derived(
    sections.map((section) => {
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

  function selectLesson(item) {
    if (!item.video) return; // "Akan Datang" items aren't clickable
    selectedLesson = item.label;
    currentVideo = item.video;
    sidebarOpen = false; // auto-hide panel after picking a lesson
  }

  function toggleSidebar(e) {
    e.stopPropagation();
    sidebarOpen = !sidebarOpen;
  }
</script>

<!-- MAIN CONTAINER -->
<div class="flex flex-1 relative">

  <!-- Menu button styled as a half-circle tab attached to the navbar's bottom edge -->
  <!-- top-16 must match the header's height (h-16) set in +layout.svelte -->
  <button
      bind:this={menuBtnEl}
      onclick={toggleSidebar}
      class="absolute top-10 left-4 z-50 w-11 h-9 bg-[#4a7425] rounded-b-full shadow-md flex items-start justify-center focus:outline-none "
    >
      <span class="text-white text-lg leading-none m-0.5">☰</span>
  </button>

  <!-- SYLLABUS SIDEBAR (Hidden everywhere by default) -->
  <aside
    bind:this={sidebarEl}
    class="fixed top-0 left-0 w-64 h-full bg-[#4a7425] text-white pt-28 p-4 z-40 transform transition-all duration-300 ease-in-out shadow-2xl overflow-y-auto {sidebarOpen
      ? ''
      : '-translate-x-full'}"
  >

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
                  {#if item.video}
                    <li
                      onclick={() => selectLesson(item)}
                      class="lesson-item cursor-pointer hover:text-white p-1 rounded transform transition-all duration-200 hover:translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm {selectedLesson ===
                      item.label
                        ? 'bg-blue-800 text-white'
                        : ''}"
                    >
                      {item.label}
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
        <iframe
          class="w-full h-full"
          src={currentVideo}
          title={selectedLesson}
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>

      <p class="lg:hidden block sm:hidden text-center text-sm text-gray-500 mb-2 pt-10">
        Tip: Putarkan peranti secara melintang untuk melihat video dengan lebih baik.
      </p>
    </div>
  </main>
</div>

<style>
  /* Hide the default disclosure marker in Safari/Chrome */
  details > summary::-webkit-details-marker {
    display: none;
  }
</style>