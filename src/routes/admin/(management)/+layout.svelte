<!-- src/routes/admin/(management)/+layout.svelte -->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  let { children } = $props();

  const titles: Record<string, string> = {
    "/admin/sidebarDashboard": "Sidebar Management",
    "/admin/notesDashboard": "Notes Management",
    "/admin/ordersDashboard": "Orders Management",
    "/admin/announcementsDashboard": "Announcements",
    "/admin/usersDashboard": "User Management",
  };
</script>

<div class="min-h-screen bg-gray-50/50">
  <!-- Not sticky/top-0: the root layout already has a sticky h-24 header,
       stacking another sticky header under it would overlap/hide content. -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
      <button
        onclick={() => goto("/admin")}
        aria-label="Back to admin dashboard"
        class="p-2 -ml-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition"
      >
        <svg
          class="h-5 w-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="text-xl font-bold text-gray-900">
        {titles[page.url.pathname] ?? "Admin"}
      </h1>
    </div>
  </div>

  <main class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
    {@render children()}
  </main>
</div>
