<!-- src/lib/components/skeletons/HomeSkeleton.svelte -->
<!--
  Mirrors +page.svelte's structure 1:1 so swapping this in/out on
  navigation causes zero layout shift. Update both together if the
  real page's layout changes.
-->
<main class="bg-gray-50 pb-24">
  <div class="max-w-5xl mx-auto px-4 py-6 space-y-6">
    <!-- Sambung Belajar -->
    <div class="bg-emerald-50 rounded-xl p-4 sm:p-5 animate-pulse">
      <div class="flex items-center justify-between mb-3">
        <div class="h-4 w-32 bg-emerald-200/60 rounded"></div>
        <div class="h-4 w-16 bg-emerald-200/60 rounded"></div>
      </div>
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <div
          class="w-full sm:w-40 h-24 rounded-lg bg-emerald-200/60 shrink-0"
        ></div>
        <div class="flex-1 w-full space-y-3">
          <div class="h-3 w-16 bg-emerald-200/60 rounded"></div>
          <div class="h-4 w-3/4 bg-emerald-200/60 rounded"></div>
          <div class="h-2 w-full bg-emerald-200/60 rounded-full"></div>
        </div>
        <div
          class="h-12 w-full sm:w-32 bg-emerald-200/60 rounded-lg shrink-0"
        ></div>
      </div>
    </div>

    <!-- Menu grid (8 tiles, matches menuTiles length) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {#each [1, 2, 3, 4, 5, 6, 7, 8] as index (index)}
        <div
          class="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center gap-2 animate-pulse"
        >
          <div class="w-10 h-10 rounded-lg bg-gray-200"></div>
          <div class="h-3 w-16 bg-gray-200 rounded"></div>
          <div class="h-2 w-20 bg-gray-200 rounded"></div>
        </div>
      {/each}
    </div>

    <!-- Progress donut -->
    <div class="grid sm:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl shadow p-5 sm:col-span-2 animate-pulse">
        <div class="h-4 w-40 bg-gray-200 rounded mb-4"></div>
        <div class="flex items-center gap-5">
          <div class="w-24 h-24 rounded-full bg-gray-200 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-24 bg-gray-200 rounded"></div>
            <div class="h-3 w-20 bg-gray-200 rounded"></div>
            <div class="h-2 w-full bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tip + Pengumuman -->
    <div class="grid sm:grid-cols-2 gap-4">
      <div
        class="bg-yellow-50 rounded-xl p-5 flex items-center gap-4 animate-pulse"
      >
        <div class="flex-1 space-y-2">
          <div class="h-4 w-28 bg-yellow-200/60 rounded"></div>
          <div class="h-3 w-20 bg-yellow-200/60 rounded"></div>
          <div class="h-3 w-full bg-yellow-200/60 rounded"></div>
          <div class="h-3 w-3/4 bg-yellow-200/60 rounded"></div>
        </div>
        <div class="w-16 h-16 rounded-full bg-yellow-200/60 shrink-0"></div>
      </div>
      <div class="bg-blue-50 rounded-xl p-5 space-y-3 animate-pulse">
        <div class="h-4 w-32 bg-blue-200/60 rounded"></div>
        <div class="h-3 w-full bg-blue-200/60 rounded"></div>
        <div class="h-3 w-5/6 bg-blue-200/60 rounded"></div>
        <div class="h-3 w-2/3 bg-blue-200/60 rounded"></div>
      </div>
    </div>
  </div>
</main>
