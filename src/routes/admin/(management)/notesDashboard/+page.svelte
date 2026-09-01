<!-- src/routes/admin/notes/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData, PageData } from "./$types";
  import { capturePostHog } from "$lib/posthogClient";

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let isAdding = $state(false);
</script>

<svelte:head>
  <title>Nota & PDF Admin - AAR</title>
</svelte:head>

<div class="mx-auto max-w-2xl p-6 space-y-6">
  <h1 class="text-xl font-semibold">Nota & PDF Admin</h1>

  <form
    method="POST"
    action="?/add"
    use:enhance={() => {
      isAdding = true;
      return async ({ update, result }) => {
        if (result.type === "success") {
          capturePostHog("learning_resource_created");
        }
        await update();
        isAdding = false;
      };
    }}
    class="space-y-3 border-b border-gray-200 pb-6"
  >
    <label class="block">
      <span class="text-sm font-medium">Title</span>
      <input
        name="title"
        class="mt-1 w-full rounded border border-gray-300 p-2"
        placeholder="Contoh: Checklist Kerja Atap"
      />
    </label>
    <label class="block">
      <span class="text-sm font-medium"
        >Google Drive link (share → "Sesiapa yang ada pautan")</span
      >
      <input
        name="driveUrl"
        class="mt-1 w-full rounded border border-gray-300 p-2 font-mono text-sm"
        placeholder="https://drive.google.com/file/d/.../view"
      />
    </label>
    <button
      type="submit"
      disabled={isAdding}
      class="rounded bg-gray-800 px-4 py-2 text-white disabled:opacity-50"
    >
      {isAdding ? "Menambah…" : "Tambah"}
    </button>
    {#if form?.message}
      <p class="text-sm text-red-600">{form.message}</p>
    {/if}
    {#if form?.added}
      <p class="text-sm text-green-700">Berjaya ditambah.</p>
    {/if}
  </form>

  <ul class="space-y-2">
    {#each data.documents as doc (doc.id)}
      <li
        class="flex items-center justify-between rounded border border-gray-200 p-3"
      >
        <span class="text-sm">{doc.title}</span>
        <form
          method="POST"
          action="?/remove"
          use:enhance={() => {
            return async ({ update, result }) => {
              if (result.type === "success") {
                capturePostHog("learning_resource_deleted");
              }
              await update();
            };
          }}
        >
          <input type="hidden" name="id" value={doc.id} />
          <button type="submit" class="text-sm text-red-600">Padam</button>
        </form>
      </li>
    {:else}
      <li class="text-sm text-gray-500">Tiada nota/PDF lagi.</li>
    {/each}
  </ul>
</div>
