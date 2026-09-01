<!-- src/routes/+page.svelte -->
<script lang="ts">
  /** @type {{ data: { user: any, admin: boolean, continueLesson: any | null, announcements: { id: string, text: string, created_at: string }[] } }} */
  let { data } = $props();
  let index = $state(0);

  const teleLink = "https://t.me/+3EReJANa7eszNjJl";
  import quotes from "$lib/quotes.json";
  import { renderAnnouncementMarkdown } from "$lib/markdown";
  import { resolve } from "$app/paths";
  const phone = "60103163654";
  const waLink = `https://wa.me/${phone}`;

  $effect(() => {
    const timer = setInterval(() => {
      index = (index + 1) % quotes.length;
    }, 10000);

    return () => clearInterval(timer);
  });
  let current = $derived(quotes[index]);
  let warningState = $state(true);

  const menuTiles = [
    {
      label: "Modul Video",
      sub: "Belajar ikut modul",
      href: "/classroom",
      icon: "play",
      disabled: false,
    },
    {
      label: "Nota & PDF",
      sub: "Nota daripada Abang Rumah",
      href: "/notes",
      icon: "doc",
      disabled: false,
    },
    {
      label: "Checklist Tapak",
      sub: "Senarai semak kerja",
      href: "/akan-datang",
      icon: "clipboard",
      disabled: true,
    },
    {
      label: "Kalkulator",
      sub: "Kira anggaran kos",
      href: "/akan-datang",
      icon: "calculator",
      disabled: true,
    },
    {
      label: "SOP Kerja",
      sub: "Panduan kerja tapak",
      href: "/akan-datang",
      icon: "hardhat",
      disabled: true,
    },
    {
      label: "Tanya Abang Rumah",
      sub: "Soalan & jawapan",
      href: waLink,
      icon: "chat",
      disabled: false,
    },
    {
      label: "Group VVIP",
      sub: "Group Ekslusif di Telegram",
      href: teleLink,
      icon: "users",
      disabled: false,
    },
    {
      label: "Bonus & Template",
      sub: "Template & bonus",
      href: "/akan-datang",
      icon: "gift",
      disabled: true,
    },
  ];

  export function closeWarning() {
    warningState = false;
  }
</script>

<svelte:head>
  <title>Menu Utama - Akademi Abang Rumah</title>
  <meta
    name="description"
    content="Menu Utama untuk platform Akademi Abang Rumah"
  />
</svelte:head>

<main
  class="min-h-dvh bg-[#FAF9F5] pb-24"
  style="padding-top: max(1.5rem, env(safe-area-inset-top));"
>
  <div class="max-w-5xl mx-auto px-4 space-y-6">
    {#if warningState === true}
      <div
        class="flex items-start gap-2.5 rounded-2xl bg-red-50 text-red-700 text-[13.5px] leading-relaxed px-4 py-3"
      >
        <span class="font-semibold shrink-0">!</span>
        <span class="flex-1">
          Ada beberapa video tidak dapat ditrack. Harap maaf atas kesulitan ini.
          Kami akan baikinya dalam masa terdekat ini
        </span>
        <button
          onclick={closeWarning}
          aria-label="Tutup"
          class="shrink-0 text-red-700/70 hover:text-red-700"
        >
          ⤫
        </button>
      </div>
    {/if}

    {#if data.showElement}
      <!-- Welcome / registration banner -->
      <div
        class="bg-linear-to-r from-[#1a1a1a] to-[#3a3a3a] rounded-3xl overflow-hidden relative"
      >
        <div class="p-6 sm:p-8">
          <p class="text-red-500 font-extrabold text-2xl sm:text-3xl italic">
            Tahniah!
          </p>
          <p class="text-red-600 font-extrabold text-3xl sm:text-4xl -mt-1">
            DAFTAR
          </p>
          <p class="text-white/90 text-sm mt-2 max-w-xs">
            Selamat datang ke <span class="text-[#7fbf5f] font-bold"
              >AKADEMI ABANG RUMAH</span
            >
          </p>
        </div>
      </div>
    {/if}

    <!-- Sambung Belajar -->
    {#await data.continueLesson}
      <!-- Skeleton mirrors the resolved card's layout so there's no
			     layout shift when the real data streams in. -->
      <div
        class="bg-white rounded-3xl border border-gray-200 px-5 py-6 sm:px-7 sm:py-7 animate-pulse"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="h-4 w-32 bg-gray-200 rounded"></div>
          <div class="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <div
            class="w-full sm:w-40 h-24 rounded-2xl bg-gray-200 shrink-0"
          ></div>
          <div class="flex-1 w-full space-y-3">
            <div class="h-3 w-16 bg-gray-200 rounded"></div>
            <div class="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div class="h-2 w-full bg-gray-200 rounded-full"></div>
          </div>
          <div
            class="h-12 w-full sm:w-32 bg-gray-200 rounded-2xl shrink-0"
          ></div>
        </div>
      </div>
    {:then continueLesson}
      {#if continueLesson}
        <a
          href="{resolve('/classroom')}?item={continueLesson.id}"
          class="block bg-white rounded-3xl border border-gray-200 px-5 py-6 sm:px-7 sm:py-7 hover:border-[#4a7425]/40 transition-colors"
        >
          <div class="flex items-center justify-between mb-3">
            <div
              class="flex items-center gap-2 text-[#4a7425] font-semibold text-[13.5px]"
            >
              <span class="text-lg">▶</span> SAMBUNG BELAJAR
            </div>
            <span class="text-[13.5px] text-gray-500">Lihat Semua ›</span>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <div class="relative w-full sm:w-40 shrink-0">
              {#if continueLesson.thumbnail}
                <img
                  src={continueLesson.thumbnail}
                  alt={continueLesson.title}
                  class="w-full h-24 object-cover rounded-2xl"
                  fetchpriority="high"
                />
              {:else}
                <!-- No thumbnail source for Google Drive lessons — generic
								     placeholder instead of a broken/missing image. -->
                <div
                  class="w-full h-24 rounded-2xl bg-[#4a7425]/10 flex items-center justify-center text-3xl"
                >
                  🎬
                </div>
              {/if}
              {#if continueLesson.durationLabel}
                <span
                  class="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded"
                >
                  {continueLesson.durationLabel}
                </span>
              {/if}
              <span class="absolute inset-0 flex items-center justify-center">
                <span
                  class="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-[#4a7425]"
                  >▶</span
                >
              </span>
            </div>
            <div class="flex-1 w-full">
              <p class="text-xs font-semibold text-[#4a7425] mb-0.5">
                Modul {continueLesson.moduleNumber}
              </p>
              <p class="font-semibold text-gray-900 mb-2">
                {continueLesson.title}
              </p>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-[#4a7425] h-2 rounded-full"
                  style="width: {continueLesson.progressPercent}%"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {continueLesson.progressPercent}%
              </p>
            </div>
            <button
              class="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-[#4a7425] text-white font-semibold text-[14.5px] rounded-2xl px-5
              hover:bg-[#3d5f1f] active:scale-[0.98] transition-all cursor-pointer"
              style="height: 48px;"
            >
              Sambung Belajar ▶
            </button>
          </div>
        </a>
      {:else}
        <!-- No progress yet (new user, or nothing accessible) — a starting
			     prompt instead of fabricated placeholder progress. -->
        <a
          href={resolve("/classroom")}
          class="block bg-white rounded-3xl border border-gray-200 px-5 py-7 hover:border-[#4a7425]/40 transition-colors text-center"
        >
          <p class="font-semibold text-[#4a7425] mb-1">
            ▶ Mula Belajar Sekarang
          </p>
          <p class="text-[13.5px] text-gray-500">
            Belum ada video ditonton lagi — jom mula modul pertama anda.
          </p>
        </a>
      {/if}
    {:catch}
      <!-- Rare: only fires if loadContinueLesson() throws server-side —
		     same fallback as the "nothing accessible" empty state. -->
      <a
        href={resolve("/classroom")}
        class="block bg-white rounded-3xl border border-gray-200 px-5 py-7 hover:border-[#4a7425]/40 transition-colors text-center"
      >
        <p class="font-semibold text-[#4a7425] mb-1">
          ▶ Mula Belajar Sekarang
        </p>
        <p class="text-[13.5px] text-gray-500">
          Belum ada video ditonton lagi — jom mula modul pertama anda.
        </p>
      </a>
    {/await}

    <!-- Menu grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {#each menuTiles as tile (tile)}
        <svelte:element
          this={tile.disabled ? "div" : "a"}
          href={tile.disabled ? undefined : tile.href}
          class="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center text-center gap-2 transition-all relative pointer-events-auto
					{tile.disabled
            ? 'opacity-50 pointer-events-none select-none'
            : 'hover:border-[#4a7425]/40 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer'}"
        >
          {#if tile.disabled}
            <span
              class="absolute top-1.5 right-1.5 text-[9px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full"
            >
              Akan Datang
            </span>
          {/if}
          <span
            class="w-10 h-10 rounded-xl bg-[#4a7425]/10 flex items-center justify-center text-[#4a7425] text-xl"
          >
            {#if tile.icon === "play"}▶{:else if tile.icon === "doc"}📄{:else if tile.icon === "clipboard"}📋{:else if tile.icon === "calculator"}🧮{:else if tile.icon === "hardhat"}👷{:else if tile.icon === "chat"}💬{:else if tile.icon === "users"}👥{:else if tile.icon === "gift"}🎁{/if}
          </span>
          <span
            class="font-semibold text-[13.5px] {tile.disabled
              ? 'text-gray-500'
              : 'text-gray-900'}">{tile.label}</span
          >
          <span class="text-xs text-gray-500">{tile.sub}</span>
        </svelte:element>
      {/each}
    </div>

    <!-- Progress + Latest videos — both disabled for now. Neither has a
	     real data source yet: the donut needs a defined "total modules"
	     count to be meaningful, and "latest videos" needs publish dates,
	     which sidebar-data.json doesn't carry. Showing them grayed out
	     with "Akan Datang" beats showing fabricated numbers. -->
    <div class="grid sm:grid-cols-2 gap-4">
      <!-- Progress donut (disabled) -->
      <div
        class="bg-white rounded-3xl border border-gray-200 p-5 opacity-50 pointer-events-none select-none relative sm:col-span-2"
      >
        <span
          class="absolute top-3 right-3 text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
        >
          Akan Datang
        </span>
        <p class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          📊 KEMAJUAN BELAJAR SAYA
        </p>
        <div class="flex items-center gap-5">
          <div
            class="w-24 h-24 rounded-full shrink-0 flex items-center justify-center bg-gray-100"
          >
            <div
              class="w-18 h-18 rounded-full bg-white flex flex-col items-center justify-center"
            >
              <span class="font-extrabold text-lg text-gray-400">--%</span>
              <span class="text-[10px] text-gray-400">Selesai</span>
            </div>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-400">-- / -- Modul</p>
            <p class="text-xs text-gray-400 mb-2">Modul selesai</p>
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2"></div>
            <p class="text-xs text-gray-400">
              Ciri ini akan datang tidak lama lagi.
            </p>
          </div>
        </div>
      </div>

      <!-- Latest videos (disabled) -->
      <!-- <div class="bg-white rounded-3xl border border-gray-200 p-5 opacity-50 pointer-events-none select-none relative">
				<span class="absolute top-3 right-3 text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
					Akan Datang
				</span>
				<p class="font-semibold text-gray-900 mb-3 flex items-center gap-2">▶ VIDEO TERBARU</p>
				<p class="text-[13.5px] text-gray-400">Ciri ini akan datang tidak lama lagi.</p>
			</div> -->
    </div>

    <!-- Tip + Pengumuman -->
    <div class="grid sm:grid-cols-2 gap-4">
      <div class="bg-yellow-50 rounded-3xl p-5 flex items-center gap-4">
        <div class="flex-1">
          {#key current.id}
            <p class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              💡 TIP HARI INI
            </p>
            <p class="font-semibold text-[#4a7425]">{current.category}</p>
            <p class="text-[13.5px] text-gray-700 italic">
              {current.quote}
            </p>
            <p class="text-xs text-gray-500 mt-1">– Abang Rumah</p>
          {/key}
        </div>
        <img
          src="/assets/images/enayub cta poster.webp"
          alt="Abang Rumah"
          class="w-16 h-16 rounded-full object-cover shrink-0"
        />
      </div>
      <div class="bg-blue-50 rounded-3xl p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="font-semibold text-gray-900 flex items-center gap-2">
            📢 PENGUMUMAN
          </p>
        </div>
        <ul class="space-y-2">
          {#each data.announcements as item (item.id)}
            <li class="text-[13.5px] text-gray-700 flex gap-2">
              <span class="text-[#4a7425]">•</span>
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              <span>{@html renderAnnouncementMarkdown(item.text)}</span>
            </li>
          {:else}
            <li class="text-[13.5px] text-gray-400">
              Tiada pengumuman buat masa ini.
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</main>
