<!-- src/lib/components/skeletons/ClassroomSkeleton.svelte -->
<!--
  Mirrors the classroom page's MAIN CANVAS only. The syllabus sidebar
  starts translate-x-full (closed/off-screen) by default, so it's not
  visible on first paint — no need to skeleton something the user can't
  see yet. If that default ever changes, revisit this.
-->
<div class="flex h-screen overflow-hidden relative">
  <main class="flex-1 p-4 lg:p-8 bg-gray-50 items-center flex-col flex">
    <div class="max-w-4xl mx-auto flex flex-col items-center w-full">
      <div class="h-8 w-2/3 bg-gray-200 rounded animate-pulse mb-6"></div>

      <div
        class="aspect-[9/16] max-w-[450px] w-full bg-gray-300 rounded-lg shadow-inner animate-pulse"
      ></div>
    </div>
  </main>
</div>
