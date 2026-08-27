<!-- src/routes/notes/[id]/+page.svelte -->
<script lang="ts">
  import { resolve } from "$app/paths";

  let { data } = $props();
</script>

<svelte:head>
  <title>{data.document.title} - Akademi Abang Rumah</title>
</svelte:head>

<main class="bg-gray-50 min-h-screen pb-24">
  <div class="max-w-4xl mx-auto px-4 py-6 space-y-4">
    <a href={resolve("/notes")} class="text-sm text-gray-500">‹ Nota & PDF</a>
    <h1 class="text-lg font-bold text-gray-900">{data.document.title}</h1>

    <div class="bg-white rounded-xl shadow overflow-hidden">
      <iframe
        src={data.document.embed_url}
        title={data.document.title}
        class="w-full"
        style="height: 75vh; border: 0;"
      ></iframe>
    </div>

    <!-- Some in-app browsers / older Android WebViews don't render Drive's
         iframe reliably — this link is the fallback so nobody gets stuck
         looking at a blank box. -->
    <a
      href={resolve(data.document.drive_url)}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-block text-sm text-gray-500 underline"
    >
      Buka dalam Google Drive
    </a>
  </div>
</main>
