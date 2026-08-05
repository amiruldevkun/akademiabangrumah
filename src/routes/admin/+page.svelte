<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Admin Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50/50">
  <header class="bg-white border-b border-gray-200">
    <div
      class="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2 min-w-0">
        <a
          href="/"
          aria-label="Back to main menu"
          class="flex items-center gap-1.5 p-2 -ml-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0 text-gray-600"
        >
          <svg
            class="h-5 w-5 shrink-0"
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
          <span class="text-sm font-medium hidden sm:inline">Main Menu</span>
        </a>
        <h1 class="text-xl font-bold text-gray-900 truncate">
          Admin Dashboard
        </h1>
      </div>
      <span
        class="text-sm text-gray-500 truncate shrink-0 max-w-[35%] sm:max-w-none"
        >{data.user?.email}</span
      >
    </div>
  </header>

  <main class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <a
        href="/admin/sidebarDashboard"
        data-sveltekit-preload-data="hover"
        class="bg-white border border-gray-200 rounded-lg p-6 text-left hover:shadow-md hover:border-indigo-300 transition"
      >
        <h2 class="text-lg font-medium text-gray-900">Manage Sidebar</h2>
        <p class="text-sm text-gray-500 mt-1">
          Add, edit, or remove sidebar items
        </p>
      </a>

      <a
        href="/admin/notesDashboard"
        data-sveltekit-preload-data="hover"
        class="bg-white border border-gray-200 rounded-lg p-6 text-left hover:shadow-md hover:border-emerald-300 transition"
      >
        <h2 class="text-lg font-medium text-gray-900">Manage Notes</h2>
        <p class="text-sm text-gray-500 mt-1">Upload and manage notes</p>
      </a>

      <a
        href="/admin/announcementDashboard"
        data-sveltekit-preload-data="hover"
        class="bg-white border border-gray-200 rounded-lg p-6 text-left hover:shadow-md hover:border-sky-300 transition"
      >
        <h2 class="text-lg font-medium text-gray-900">Manage Announcements</h2>
        <p class="text-sm text-gray-500 mt-1">
          Edit the homepage announcement feed
        </p>
      </a>

      <a
        href="/admin/usersDashboard"
        data-sveltekit-preload-data="hover"
        class="bg-white border border-gray-200 rounded-lg p-6 text-left hover:shadow-md hover:border-rose-300 transition"
      >
        <h2 class="text-lg font-medium text-gray-900">Manage Users</h2>
        <p class="text-sm text-gray-500 mt-1">
          Search users, toggle admin or paid access
        </p>
      </a>
    </div>
  </main>
</div>
