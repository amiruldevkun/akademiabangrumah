<!-- src/routes/notes/+page.svelte -->
<script lang="ts">
  import { resolve } from "$app/paths";

  let { data } = $props();
</script>

<svelte:head>
  <title>Nota & PDF - Akademi Abang Rumah</title>
</svelte:head>

<main class="bg-gray-50 min-h-screen pb-24">
  <div class="max-w-3xl mx-auto px-4 py-6 space-y-4">
    <div>
      <a href={resolve("/")} class="text-sm text-gray-500">‹ Menu Utama</a>
      <h1 class="text-xl font-bold text-gray-900 mt-1">📄 Nota & PDF</h1>
    </div>

    <div class="grid gap-3">
      {#each data.documents as doc (doc.id)}
        {#if doc.locked}
          <div
            class="bg-white rounded-xl shadow p-4 flex items-center justify-between opacity-60 select-none"
          >
            <span class="font-semibold text-gray-500">{doc.title}</span>
            <span
              class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full shrink-0"
            >
              🔒 Ahli Sahaja
            </span>
          </div>
        {:else}
          <a
            href={resolve("/notes/{doc.id}")}
            class="bg-white rounded-xl shadow p-4 flex items-center justify-between hover:shadow-md transition"
          >
            <span class="font-semibold text-gray-900">{doc.title}</span>
            <span class="text-[#4a7425] shrink-0">Buka ›</span>
          </a>
        {/if}
      {:else}
        <p class="text-sm text-gray-500">Belum ada nota/PDF ditambah lagi.</p>
      {/each}
    </div>
  </div>
</main>
