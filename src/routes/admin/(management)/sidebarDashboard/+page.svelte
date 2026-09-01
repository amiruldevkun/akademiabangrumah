<script lang="ts">
  // src/routes/admin/sidebarDashboard/+page.svelte
  import { enhance } from "$app/forms";
  import type { ActionData, PageData } from "./$types";
  import type { SidebarSection } from "$lib/sidebarParser";
  import { resolve } from "$app/paths";
  import { capturePostHog } from "$lib/posthogClient";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let rawText = $state("");
  let isParsing = $state(false);
  let isPushing = $state(false);

  // Keep the last successfully parsed result in state so the "Push" form
  // still has something to submit even after the page re-renders.
  let parsedSections = $state<SidebarSection[] | null>(null);

  $effect(() => {
    if (form?.parsed) {
      parsedSections = form.parsed.sections;
    }
  });

  let sectionsJson = $derived(
    parsedSections ? JSON.stringify(parsedSections) : "",
  );
</script>

<svelte:head>
  <title>Sidebar Dashboard - Admin AAR</title>
</svelte:head>
<div class="mx-auto max-w-3xl p-6 space-y-6">
  <div>
    <h1 class="text-xl font-semibold">Sidebar Content Admin</h1>
    <p class="text-sm text-gray-500">
      Current live version: {data.currentVersion ?? "—"}
      {#if data.currentUpdatedAt}
        (updated {new Date(data.currentUpdatedAt).toLocaleString()})
      {/if}
    </p>
  </div>

  <!-- Step 1: paste + parse -->
  <form
    method="POST"
    action="?/parse"
    use:enhance={() => {
      isParsing = true;
      return async ({ update }) => {
        await update();
        isParsing = false;
      };
    }}
    class="space-y-3"
  >
    <div class="space-y-2">
      <label class="block">
        <span class="text-sm font-medium">Upload the exported .txt file</span>
        <input
          type="file"
          accept=".txt,text/plain"
          class="mt-1 file-input file-input-sm pointer-events-auto"
          onchange={async (e) => {
            const file = (e.currentTarget as HTMLInputElement).files?.[0];
            if (!file) return;
            rawText = await file.text();
          }}
        />
      </label>

      <label class="block">
        <span class="text-sm font-medium"
          >...or paste the exported Google Doc text directly</span
        >
        <textarea
          name="rawText"
          bind:value={rawText}
          rows="14"
          class="mt-1 w-full rounded border border-gray-300 p-3 font-mono text-sm"
          placeholder="Tajuk Modul Video Panduan VVIP Akademi Abang Rumah..."
        ></textarea>
      </label>
    </div>

    <button
      type="submit"
      disabled={isParsing || rawText.trim().length === 0}
      class="cursor-pointer rounded bg-gray-800 px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isParsing ? "Parsing…" : "Parse"}
    </button>

    {#if form?.message}
      <p class="text-sm text-red-600">{form.message}</p>
    {/if}
  </form>

  <!-- Step 2: preview + push -->
  {#if parsedSections}
    {@const stats = form?.parsed?.stats}
    <div class="rounded border border-gray-200 p-4 space-y-4">
      <div class="flex flex-wrap gap-4 text-sm text-gray-700">
        <span><strong>{parsedSections.length}</strong> sections</span>
        {#if stats}
          <span><strong>{stats.totalItems}</strong> items</span>
          <span><strong>{stats.videosReady}</strong> videos ready</span>
          <span><strong>{stats.akanDatang}</strong> akan datang</span>
        {/if}
      </div>

      {#if stats?.warnings?.length}
        <div class="rounded bg-yellow-50 p-3 text-sm text-yellow-800">
          <p class="font-medium">Warnings — these lines were skipped:</p>
          <ul class="list-disc pl-5">
            {#each stats.warnings as w (w)}
              <li>{w}</li>
            {/each}
          </ul>
        </div>
      {/if}

      <div class="max-h-96 space-y-3 overflow-y-auto">
        {#each parsedSections as section (section)}
          <details class="rounded border border-gray-100 p-2" open>
            <summary class="cursor-pointer font-medium">
              {section.title} ({section.items.length})
            </summary>
            <ul class="mt-2 space-y-1 pl-4 text-sm">
              {#each section.items as item (item)}
                <li class="flex items-center gap-2">
                  <span class={item.video ? "text-green-700" : "text-gray-400"}>
                    {item.video ? "●" : "○"}
                  </span>
                  {item.label}
                </li>
              {/each}
            </ul>
          </details>
        {/each}
      </div>

      <form
        method="POST"
        action="?/push"
        use:enhance={() => {
          isPushing = true;
          return async ({ update, result }) => {
            if (result.type === "success") {
              capturePostHog("sidebar_content_published", {
                section_count: parsedSections?.length ?? 0,
              });
            }
            await update();
            isPushing = false;
          };
        }}
      >
        <input type="hidden" name="sectionsJson" value={sectionsJson} />
        <button
          type="submit"
          disabled={isPushing}
          class="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {isPushing ? "Pushing…" : "Push to Supabase"}
        </button>
      </form>

      <a
        href={resolve("/classroom")}
        hidden={!form?.pushed}
        class="rounded bg-green-700 px-4 py-2 text-white mb-1 disabled:opacity-50"
      >
        Click to check results!
      </a>

      {#if form?.pushed}
        <p class="text-sm mt-2 text-green-700">
          Pushed — now live as version {form.newVersion}.
        </p>
      {/if}
    </div>
  {/if}
</div>
