<script lang="ts">
  import { onMount } from "svelte";

  type ChangelogCommit = { id: string; message: string; group: string };
  type ChangelogRelease = {
    version: string;
    date: string;
    commits: ChangelogCommit[];
  };

  const STORAGE_KEY = "aar_changelog_last_seen_version";
  // Point this to your Cloudflare R2 bucket URL or local static asset
  const CHANGELOG_URL = "/changelog.json";

  const GROUP_LABELS: Record<string, string> = {
    Features: "Ciri Baharu",
    "Bug Fixes": "Pembetulan",
    Performance: "Prestasi",
    Refactoring: "Penambahbaikan",
    Styling: "Reka Bentuk",
    Documentation: "Dokumentasi",
    Maintenance: "Penyelenggaraan",
  };

  const GROUP_ORDER = [
    "Features",
    "Bug Fixes",
    "Performance",
    "Refactoring",
    "Styling",
    "Documentation",
    "Maintenance",
  ];

  let dialogEl: HTMLDialogElement;
  let latest = $state<ChangelogRelease | null>(null);
  let grouped = $state<Record<string, ChangelogCommit[]>>({});

  // Clean commit prefixes (e.g. "feat(auth): added x" -> "Added x")
  function cleanMessage(msg: string): string {
    return msg
      .replace(
        /^(feat|fix|chore|code|style|docs|refactor|perf)(\([^)]+\))?:\s*/i,
        "",
      )
      .replace(/^[a-z]/, (c) => c.toUpperCase());
  }

  function groupCommits(release: ChangelogRelease) {
    const map: Record<string, ChangelogCommit[]> = {};
    for (const commit of release.commits) {
      const key = GROUP_LABELS[commit.group] ? commit.group : "Other";
      (map[key] ??= []).push({
        ...commit,
        message: cleanMessage(commit.message),
      });
    }
    return map;
  }

  onMount(async () => {
    let lastSeen: string | null = null;
    try {
      lastSeen = localStorage.getItem(STORAGE_KEY);
    } catch {
      return; // Skip silently if localStorage is restricted
    }

    try {
      const res = await fetch(CHANGELOG_URL);
      if (!res.ok) return;

      const releases: ChangelogRelease[] = await res.json();
      if (!releases.length) return;

      latest = releases[0];

      if (lastSeen !== latest.version) {
        grouped = groupCommits(latest);
        dialogEl?.showModal();
      }
    } catch (e) {
      console.warn("Could not load changelog:", e);
    }
  });

  function dismiss() {
    if (latest) {
      try {
        localStorage.setItem(STORAGE_KEY, latest.version);
      } catch {
        // Ignore storage write issues
      }
    }
    dialogEl?.close();
  }
</script>

<dialog bind:this={dialogEl} class="modal" onclose={dismiss}>
  <div class="modal-box">
    {#if latest}
      <form method="dialog">
        <button
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onclick={dismiss}
          aria-label="Tutup"
        >
          ✕
        </button>
      </form>

      <h3 class="text-lg font-bold">Apa yang baru — {latest.version}</h3>
      <p class="text-xs text-base-content/60 mt-0.5">{latest.date}</p>

      <div class="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {#each GROUP_ORDER.filter((g) => grouped[g]?.length) as group}
          <div>
            <h4 class="font-semibold text-sm mb-1">{GROUP_LABELS[group]}</h4>
            <ul
              class="list-disc list-inside space-y-1 text-sm text-base-content/80"
            >
              {#each grouped[group] as commit}
                <li>{commit.message}</li>
              {/each}
            </ul>
          </div>
        {/each}

        {#if grouped["Other"]?.length}
          <div>
            <h4 class="font-semibold text-sm mb-1">Lain-lain</h4>
            <ul
              class="list-disc list-inside space-y-1 text-sm text-base-content/80"
            >
              {#each grouped["Other"] as commit}
                <li>{commit.message}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <div class="modal-action">
        <button class="btn bg-[#4a7425] w-full text-white" onclick={dismiss}
          >Faham!</button
        >
      </div>
    {/if}
  </div>

  <form method="dialog" class="modal-backdrop">
    <button onclick={dismiss}>close</button>
  </form>
</dialog>
