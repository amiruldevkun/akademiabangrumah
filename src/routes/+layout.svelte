<!-- src/routes/+layout.svelte-->
<script lang="ts">
  import "../style.css";
  import { onMount, type Component, type Snippet } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { invalidate, onNavigate, goto } from "$app/navigation";
  import { page, navigating } from "$app/state";
  import { resolve } from "$app/paths";
  import type { User } from "@supabase/supabase-js";

  // Components
  import HomeSkeleton from "$lib/homeSkeleton.svelte";
  import ClassroomSkeleton from "$lib/classroomSkeleton.svelte";
  import NotesSelectorSkeleton from "$lib/notesSelectorSkeleton.svelte";
  import NotesDocsSkeleton from "$lib/notesDocsSkeleton.svelte";
  import ChangelogPopup from "$lib/changelogPopup.svelte";

  // --- Type Definitions ---
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => void;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }

  type LayoutProps = {
    data?: {
      user?: User | null; // Kept as any to not break your Supabase metadata
      admin?: boolean | null; // Changed from any to boolean
    };
    children: Snippet;
  };

  // --- State & Props ---
  let { data, children }: LayoutProps = $props();
  let user: User | null = $derived(data?.user ?? null);

  let deferredPrompt: BeforeInstallPromptEvent | null = $state(null);
  let showBanner = $state(false);

  const phone = "60103163654";
  const waLink = `https://wa.me/${phone}`;
  const userRoutes = ["/classroom", "/notes", "/"];

  const SKELETON_ROUTES: Record<string, Component> = {
    "/": HomeSkeleton,
    "/classroom": ClassroomSkeleton,
    "/notes": NotesSelectorSkeleton,
    "/notes/[id]": NotesDocsSkeleton,
  };

  // --- Derived Values ---
  let ActiveSkeleton = $derived(
    navigating.to?.route.id
      ? SKELETON_ROUTES[navigating.to.route.id]
      : undefined,
  );

  const hideRoutes = $derived(
    [
      "/admin",
      "/profile",
      "/landing",
      "/login",
      "/sign_up",
      "/about",
      "/forgot_password",
      "/auth/reset_password",
      "/auth/error",
      "/auth/confirm_reset",
      "/pay_landing",
    ].some((p) => page.url.pathname.startsWith(p)),
  );

  const navItems = $derived([
    { href: resolve("/"), label: "Home", icon: "🏠" },
    { href: resolve("/classroom"), label: "Belajar", icon: "📺" },
    { href: resolve("/notes"), label: "Nota", icon: "📑" },
    { href: waLink, label: "Bantuan", icon: "💬" },
  ]);

  // --- Effects & Lifecycle ---
  $effect(() => {
    user = data?.user ?? null;
  });

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    const appRoutes = ["/", "/classroom", "/notes"];
    const leavingApp = appRoutes.includes(navigation.from?.route.id ?? "");
    const enteringApp = appRoutes.includes(navigation.to?.route.id ?? "");

    if (leavingApp && enteringApp) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  onMount(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        user = session?.user ?? null;
        invalidate("supabase:auth");
      },
    );

    return () => authListener.subscription.unsubscribe();
  });

  // PWA & Install logic
  onMount(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
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

    // Fixed event name casing and removed unused parameter
    window.addEventListener("beforeinstallprompt", () => {
      console.log("beforeInstallPrompt fired");
    });
  });

  // --- Helper Functions ---
  function adminDashboard() {
    if (data?.admin === true) {
      console.log(data?.admin);
      console.log("redirecting user to adminDashboard");
      return goto(resolve("/admin"));
    } else {
      console.log("user is not admin. not doing anything");
      return 0;
    }
  }

  function profile() {
    return goto(resolve("/profile"));
  }

  async function signOut() {
    console.log("signOut called");
    const result = await Promise.race([
      supabase.auth.signOut(),
      new Promise((_, reject) => setTimeout(() => reject("TIMEOUT"), 3000)),
    ]);
    console.log("signOut result:", result);
    window.location.href = "/login";
  }

  async function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installation choice: ${outcome}`);
    deferredPrompt = null;
    showBanner = false;
  }

  function isActive(href: string) {
    if (href.startsWith("http")) return false;
    if (href === "/") return page.url.pathname === "/";
    return page.url.pathname.startsWith(href);
  }
</script>

<!-- --- HTML TEMPLATE --- -->

<header
  class="bg-[#4a7425] text-white p-1 flex items-center shadow-md z-50 h-24 pt-[env(safe-area-inset-top)]"
>
  <div class="navbar bg-[#4a7425] text-white shadow-md z-50 min-h-24">
    <div class="navbar-start">
      <!-- Fixed resolve route usage here -->
      <a
        href={resolve("/about")}
        class="btn btn-ghost hover:bg-white/10 px-0.5"
      >
        <img
          src="/assets/pwa-192x192.png"
          alt="Akademi Abang Rumah Logo"
          class="w-16 h-16"
        />
      </a>
      <span class="text-lg font-bold tracking-wider mx-2">
        AKADEMI ABANG RUMAH
      </span>
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
                  alt={user.user_metadata?.full_name ?? "User avatar"}
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
              {user.user_metadata?.full_name ?? user.email}
            </li>
            <li>
              <button class="disabled:cursor-not-allowed" onclick={profile}>
                Profil
              </button>
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
  {#if ActiveSkeleton}
    {console.log("Rendering skeletonLoader")}
    <ActiveSkeleton />
  {:else}
    {@render children()}
  {/if}
  {#if !hideRoutes}
    <ChangelogPopup />
  {/if}
</div>

{#if !hideRoutes || !userRoutes}
  <div
    class="dock bottom-0 left-0 right-0 bg-white border-t flex justify-around sm:hidden z-40"
  >
    <!-- Fixed the key assignment here! -->
    {#each navItems as item (item.href)}
      <!-- eslint-disable svelte/no-navigation-without-resolve -->
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
