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

  const userRoutes = ["/classroom", "/notes", "/"];

  const phone = "60103163654";
  const waLink = `https://wa.me/${phone}`;

  const hideRoutes = $derived(
    [
      "/admin",
      "/profile",
      "/landing",
      "/login",
      "/sign_up",
      "/about",
      "/forgot_password",
      "/reset_password",
    ].some((p) => page.url.pathname.startsWith(p)),
  );

  let navVisible = $state(true);

  type LayoutProps = {
    data?: {
      user?: any;
      admin?: any;
    };
    children: Snippet;
  };

  let { data, children }: LayoutProps = $props();

  let user = $state(data?.user ?? null);

  // to periodically refreshes user's session and auth status
  $effect(() => {
    user = data?.user ?? null;
  });

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

  // goto profile page
  function profile() {
    // console.log("redirecting user to profile");
    return goto("/profile");
  }

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

  // Bottom Nav for Mobile view
  const navItems = $derived([
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/classroom", label: "Belajar", icon: "📖" },
    { href: "/notes", label: "Nota", icon: "📝" },
    { href: waLink, label: "Bantuan", icon: "💬" },
    // { href: data?.admin ? "/admin" : "/profile", label: "Akaun", icon: "👤" },
  ]);

  function isActive(href: string) {
    if (href.startsWith("http")) return false; // external links (WhatsApp) never "active"
    if (href === "/") return page.url.pathname === "/";
    return page.url.pathname.startsWith(href);
  }
</script>

<header
  class="bg-[#4a7425] text-white p-1 flex items-center shadow-md z-50 h-24 pt-[env(safe-area-inset-top)]"
>
  <div class="navbar bg-[#4a7425] text-white shadow-md z-50 min-h-24">
    <div class="navbar-start">
      <a href="/about" class="btn btn-ghost hover:bg-white/10 px-0.5">
        <img
          src="/assets/images/akademilogov2.webp"
          alt="Akademi Abang Rumah Logo"
          class="w-16 h-auto"
        />
      </a>
      <span class="text-lg font-bold tracking-wider mx-2"
        >AKADEMI ABANG RUMAH</span
      >
    </div>

    <div class="navbar-end">
      {#if user}
        <div class="dropdown dropdown-end">
          <div
            tabindex="0"
            role="button"
            class="btn btn-ghost btn-circle avatar hover:bg-white/10"
          >
            {#if user.user_metadata?.avatar_url}
              <div class="w-10 rounded-full ring ring-white/50">
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.name ?? "User avatar"}
                />
              </div>
            {:else}
              <div
                class="w-10 rounded-full bg-white/20 flex items-center justify-center font-semibold"
              >
                {(user.user_metadata?.name ?? user.email ?? "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            {/if}
          </div>
          <ul
            tabindex="0"
            class="menu menu-md dropdown-content bg-base-100 text-gray-800 rounded-box z-50 mt-3 w-56 p-2 shadow-lg"
          >
            <li class="menu-title text-xs">
              {user.user_metadata?.name ?? user.email}
            </li>
            <li>
              <button
                class="disabled:cursor-not-allowed"
                disabled
                onclick={profile}>Profil (Akan Datang)</button
              >
            </li>
            {#if data?.admin}
              <li><button onclick={adminDashboard}>Admin Dashboard</button></li>
            {/if}
            <li><button onclick={signOut}>Log Keluar</button></li>
          </ul>
        </div>
      {/if}
    </div>
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
<div class={hideRoutes ? "" : "pb-8 sm:pb-20"}>
  {@render children()}
</div>
{#if !hideRoutes || !userRoutes}
  <div
    class="dock bottom-0 left-0 right-0 bg-white border-t flex justify-around sm:hidden z-40"
  >
    {#each navItems as item}
      <a
        href={item.href}
        class="flex flex-col items-center text-xs gap-0.5 {isActive(item.href)
          ? 'text-[#4a7425]'
          : 'text-gray-500'}"
      >
        <span class="text-lg">{item.icon}</span>
        {item.label}
      </a>
    {/each}
  </div>
{/if}

{#if ["/", "/classroom", "/notes"].some((p) => page.url.pathname.startsWith(p))}
  <footer
    class="relative z-10 bg-gray-100 text-gray-500 text-sm p-4 text-center border-t"
  >
    &copy; 2026 Akademi Abang Rumah. Hak Cipta Terpelihara.
  </footer>
{/if}
