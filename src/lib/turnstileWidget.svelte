<!-- TurnstileWidget.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";

  let { onVerify }: { onVerify: (token: string) => void } = $props();
  let widgetEl: HTMLDivElement;
  let widgetId: string | undefined;

  onMount(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // @ts-expect-error - turnstile is loaded globally
      widgetId = window.turnstile.render(widgetEl, {
        sitekey: PUBLIC_TURNSTILE_SITE_KEY,
        callback: (token: string) => onVerify(token),
        "error-callback": () => onVerify(""), // clear token if it errors
        "expired-callback": () => onVerify(""), // clear token if it expires
      });
    };
  });

  onDestroy(() => {
    if (widgetId) {
      // @ts-expect-error - turnstile is loaded globally
      window.turnstile.remove(widgetId);
    }
  });

  // expose a reset function to the parent if needed
  export function reset() {
    if (widgetId) {
      // @ts-expect-error - turnstile is loaded globally
      window.turnstile.reset(widgetId);
      onVerify("");
    }
  }
</script>

<div bind:this={widgetEl}></div>
