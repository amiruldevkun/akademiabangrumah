<!-- src/lib/components/skeletons/NotesSkeleton.svelte -->
<!--
  Mirrors src/routes/notes/+page.svelte. Row count is a guess at a
  typical list length — since it's a skeleton, an exact count doesn't
  matter (real content replaces it entirely once loaded).
-->
<main class="bg-gray-50 min-h-screen pb-24">
  <div class="max-w-3xl mx-auto px-4 py-6 space-y-4">
    <div>
      <div class="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
      <div class="h-6 w-40 bg-gray-200 rounded animate-pulse mt-2"></div>
    </div>

    <div class="grid gap-3">
      {#each Array(6) as _}
        <div
          class="bg-white rounded-xl shadow p-4 flex items-center justify-between animate-pulse"
        >
          <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
          <div class="h-3 w-12 bg-gray-200 rounded shrink-0"></div>
        </div>
      {/each}
    </div>
  </div>
</main>
