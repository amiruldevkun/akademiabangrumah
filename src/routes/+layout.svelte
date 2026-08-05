<!-- src/routes/+layout.svelte-->
<script lang="ts">
  import "../style.css";
  import { onMount, type Snippet } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  // import { createClient } from '@supabase/supabase-js'
  import { invalidate } from "$app/navigation";
  import { page } from "$app/state";
  import { onNavigate } from "$app/navigation";
  import { goto } from "$app/navigation";

  type LayoutProps = {
    data?: {
      user?: any;
      admin?: any;
    };
    children: Snippet;
  };

  let { data, children }: LayoutProps = $props();
  let profileOpen = $state(false);

  // Browser-side Supabase client — separate from the server one in hooks.server.js.
  // This lets the UI react live to login state (e.g. showing name/avatar)
  // without needing a full page reload.

  let user = $state(data?.user ?? null);

  // smoothens transistions
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  //  a button for admin button IF user is_admin = true
  function adminDashboard() {
    if (data?.admin === true) {
      console.log(data?.admin);
      console.log("redirecting user to adminDashboard");
      return goto("/admin");
    } else {
      console.log("user is not admin. not doing anything");
      return 0;
    }
  }

  onMount(() => {
    // Keep `user` in sync if the session changes in another tab, expires, etc.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        user = session?.user ?? null;
        invalidate("supabase:auth"); // re-runs load functions that depend on auth state
      },
    );

    return () => authListener.subscription.unsubscribe();
  });

  // onMount(() => {
  //   const handlePageShow = (event) => {
  //     if (event.persisted) {
  //       window.location.reload();
  //     }
  //   };
  //   window.addEventListener('pageshow', handlePageShow);
  //   return () => window.removeEventListener('pageshow', handlePageShow);
  // });

  async function signOut() {
    console.log("signOut called");
    const result = await Promise.race([
      supabase.auth.signOut(),
      new Promise((_, reject) => setTimeout(() => reject("TIMEOUT"), 3000)),
    ]);
    console.log("signOut result:", result);
    window.location.href = "/login";
  }

  // --- PWA install banner logic (unchanged from before) ---
  let deferredPrompt: any = $state();
  let showBanner = $state(false);

  onMount(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showBanner = true;
    });

    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      showBanner = false;
      console.log("App successfully installed!");
    });
  });

  onMount(async () => {
    const { pwaInfo } = await import("virtual:pwa-info");
    if (pwaInfo) {
      const { registerSW } = await import("virtual:pwa-register");
      registerSW({ immediate: true });
    }

    window.addEventListener("beforeInstallPrompt", (e) => {
      console.log("beforeInstallPrompt fired");
    });
  });

  async function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installation choice: ${outcome}`);
    deferredPrompt = null;
    showBanner = false;
  }
</script>

<header
  class="bg-[#4a7425] text-white p-1 flex items-center shadow-md z-50 h-24 pt-[env(safe-area-inset-top)]"
>
  <a href="/about">
    <img
      src="/assets/images/akademilogov2.webp"
      alt="Akademi Abang Rumah Logo"
      class="p-2 w-22 h-auto"
    />
  </a>
  <span class="text-lg font-bold tracking-wide mx-4">AKADEMI ABANG RUMAH</span>
  <div class="ms-auto">
    <!-- Logged-in user info + logout, only shown once we know who's logged in -->
    {#if user}
      <div class="flex flex-row items-center gap-2 mx-4">
        {#if data?.admin}
          <!-- if user is_admin = true, enable this button-->
          <div class="hidden md:block">
            <button
              onclick={adminDashboard}
              class="text-xs cursor-pointer bg-white text-[#4a7425] font-semibold px-3 py-1.5 rounded hover:bg-gray-100 transition"
            >
              Admin
            </button>
          </div>
        {/if}
        {#if user.user_metadata?.avatar_url}
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata?.name ?? "User avatar"}
            class="w-8 h-8 rounded-full border-2 border-white"
          />
        {/if}
        <span class="text-sm hidden sm:inline"
          >{user.user_metadata?.name ?? user.email}</span
        >
        <button
          type="button"
          onclick={signOut}
          class="text-xs cursor-pointer bg-white text-[#4a7425] font-semibold px-3 py-1.5 rounded hover:bg-gray-100 transition"
        >
          Log Keluar
        </button>
      </div>
    {/if}
  </div>
</header>

{#if showBanner && !["/landing", "/login", "/sign_up"].some( (p) => page.url.pathname.startsWith(p), )}
  <div class="bg-[#4a7425] text-white px-4 py-3 shadow-md">
    <div
      class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left"
    >
      <div class="flex items-center gap-3">
        <span class="text-2xl">📱</span>
        <p class="font-medium text-base sm:text-lg">
          Muat turun aplikasi Akademi Abang Rumah untuk akses mudah dan pantas!
        </p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button
          onclick={installPWA}
          class="bg-white text-emerald-800 font-bold px-5 py-2 rounded-lg text-sm shadow hover:bg-emerald-50 transition"
        >
          Pasang Sekarang (Install)
        </button>
        <button
          onclick={() => (showBanner = false)}
          class="text-white opacity-80 hover:opacity-100 text-sm px-2 py-2"
        >
          Nanti Saja
        </button>
      </div>
    </div>
  </div>
{/if}

{@render children()}

<footer
  class="relative z-10 bg-gray-100 text-gray-500 text-sm p-4 text-center border-t"
>
  &copy; 2026 Akademi Abang Rumah. Hak Cipta Terpelihara.
</footer>
