<!-- src/routes/admin/(management)/usersDashboard/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let togglingId = $state<string | null>(null);

  function formatDate(date: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
</script>

<svelte:head>
  <title>Users - Admin AAR</title>
</svelte:head>

<div class="space-y-4">
  <form method="GET" class="flex gap-2">
    <input
      type="text"
      name="q"
      value={data.search}
      placeholder="Search by email..."
      class="flex-1 rounded border border-gray-300 p-2 text-sm"
    />
    <button
      type="submit"
      class="rounded bg-gray-800 px-4 py-2 text-white text-sm"
    >
      Search
    </button>
  </form>

  {#if form?.message}
    <p class="text-sm text-red-600">{form.message}</p>
  {/if}

  {#if data.search && data.profiles.length === 0}
    <p class="text-sm text-gray-500 text-center py-8">
      No users found for "{data.search}".
    </p>
  {/if}

  <div class="space-y-3">
    {#each data.profiles as profile (profile.id)}
      <div class="rounded border border-gray-200 p-4 space-y-2">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-medium text-gray-900">
              {profile.full_name ?? "No name"}
            </p>
            <p class="text-sm text-gray-500">{profile.email}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            {#if profile.is_admin}
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                admin
              </span>
            {/if}
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {profile.has_paid
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'}"
            >
              {profile.has_paid ? "paid" : "not paid"}
            </span>
          </div>
        </div>

        <p class="text-xs text-gray-400">
          Joined {formatDate(profile.created_at)}
          {#if profile.paid_at}· Paid {formatDate(profile.paid_at)}{/if}
        </p>

        <div class="flex gap-2 pt-1">
          <form
            method="POST"
            action="?/toggleHasPaid"
            use:enhance={() => {
              togglingId = profile.id;
              return async ({ update }) => {
                await update();
                togglingId = null;
              };
            }}
          >
            <input type="hidden" name="id" value={profile.id} />
            <button
              type="submit"
              disabled={togglingId === profile.id}
              class="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {profile.has_paid ? "Revoke paid access" : "Grant paid access"}
            </button>
          </form>

          {#if profile.id !== data.currentUserId}
            <form
              method="POST"
              action="?/toggleAdmin"
              use:enhance={() => {
                togglingId = profile.id;
                return async ({ update }) => {
                  await update();
                  togglingId = null;
                };
              }}
            >
              <input type="hidden" name="id" value={profile.id} />
              <button
                type="submit"
                disabled={togglingId === profile.id}
                class="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                {profile.is_admin ? "Remove admin" : "Make admin"}
              </button>
            </form>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
