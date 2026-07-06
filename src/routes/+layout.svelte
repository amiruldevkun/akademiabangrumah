<script>
  import './style.css';
  import { onMount } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info'
  import { createBrowserClient } from '@supabase/ssr';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
  import { invalidate } from '$app/navigation';

  let { data, children } = $props();

  // Browser-side Supabase client — separate from the server one in hooks.server.js.
  // This lets the UI react live to login state (e.g. showing name/avatar)
  // without needing a full page reload.
  const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  let user = $state(data.session?.user ?? null);

  onMount(() => {
    // Keep `user` in sync if the session changes in another tab, expires, etc.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      user = session?.user ?? null;
      invalidate('supabase:auth'); // re-runs load functions that depend on auth state
    });

    return () => authListener.subscription.unsubscribe();
  });

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  // --- PWA install banner logic (unchanged from before) ---
  let deferredPrompt = $state(null);
  let showBanner = $state(false);

  onMount(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showBanner = true;
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      showBanner = false;
      console.log('App successfully installed!');
    });
  });

  onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({ immediate: true });
		}
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

<header class="bg-[#4a7425] text-white p-1 flex items-center shadow-md z-50 h-24 pt-[env(safe-area-inset-top)]">
  <span class="text-lg font-bold tracking-wide mx-4">AKADEMI ABANG RUMAH</span>

  <a href="/about" class="ms-auto">
    <img src="/assets/images/akademilogov2.png" alt="Akademi Abang Rumah Logo" class="p-2 w-22 h-auto">
  </a>

  <!-- Logged-in user info + logout, only shown once we know who's logged in -->
  {#if user}
    <div class="flex items-center gap-2 mx-4">
      {#if user.user_metadata?.avatar_url}
        <img
          src={user.user_metadata.avatar_url}
          alt={user.user_metadata?.full_name ?? 'User avatar'}
          class="w-8 h-8 rounded-full border-2 border-white"
        />
      {/if}
      <span class="text-sm hidden sm:inline">{user.user_metadata?.full_name ?? user.email}</span>
      <button
        onclick={signOut}
        class="text-xs bg-white text-[#4a7425] font-semibold px-3 py-1.5 rounded hover:bg-gray-100 transition"
      >
        Log Keluar
      </button>
    </div>
  {/if}
</header>

{#if showBanner}
  <div class="bg-[#4a7425] text-white px-4 py-3 shadow-md">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
      <div class="flex items-center gap-3">
        <span class="text-2xl">📱</span>
        <p class="font-medium text-base sm:text-lg">
          Muat turun aplikasi Akademi Abang Rumah untuk akses mudah dan pantas!
        </p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button onclick={installPWA} class="bg-white text-emerald-800 font-bold px-5 py-2 rounded-lg text-sm shadow hover:bg-emerald-50 transition">
          Pasang Sekarang (Install)
        </button>
        <button onclick={() => showBanner = false} class="text-white opacity-80 hover:opacity-100 text-sm px-2 py-2">
          Nanti Saja
        </button>
      </div>
    </div>
  </div>
{/if}

{@render children()}

<footer class="relative z-10 bg-gray-100 text-gray-500 text-sm p-4 text-center border-t">
  &copy; 2026 Akademi Abang Rumah. Hak Cipta Terpelihara.
</footer>