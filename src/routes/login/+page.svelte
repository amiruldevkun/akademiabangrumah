<script lang="ts">
  import { supabase } from "$lib/supabaseClient";
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import { Eye, EyeOff } from "@lucide/svelte";
  import TurnstileWidget from "$lib/turnstileWidget.svelte";

  let turnstile: TurnstileWidget | undefined = $state();
  let turnstileToken = $state("");
  let errorMessage = $derived(page.url.searchParams.get("error"));
  let emailInput = $state("");
  let emailPass = $state("");
  let signUpStatus = $state(false);
  let passError = $state("");
  let emailError = $state("");
  let showPassword = $state(false);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,

        queryParams: {
          prompt: "select_account",
        },
      },
    });
  }
</script>

<svelte:head>
  <title>Login - Akademi Abang Rumah</title>
  <meta
    name="description"
    content="Log masuk ke Akademi Abang Rumah untuk mengakses video oleh Abang Rumah!"
  />
</svelte:head>

<div class="max-h-screen flex items-center justify-center bg-gray-50">
  <div class="bg-white p-8 rounded-lg shadow-md text-center">
    <!-- Title + logo side by side -->
    <div class="flex items-center justify-center gap-3 mb-6">
      <h1 class="text-2xl font-bold text-[#4a7425]">Log Masuk</h1>
    </div>

    {#if errorMessage}
      <p class="text-red-600 text-sm mb-4">{errorMessage}</p>
    {/if}

    <div class="flex flex-col gap-2">
      <form
        method="POST"
        use:enhance={() => {
          signUpStatus = true;
          return async ({ update, result }) => {
            if (result.type === "failure") {
              turnstile?.reset();
              passError = (result.data?.passError as string) ?? "";
              emailError = (result.data?.emailError as string) ?? "";
            }
            await update();
            signUpStatus = false;
          };
        }}
      >
        <label class="gap-2 text-black">
          Masukkan email anda
          <input
            type="email"
            id="email"
            name="email"
            bind:value={emailInput}
            placeholder="studentabangrumah@gmail.com"
            class="w-full mt-2 rounded-lg border px-3 py-2.5 text-sm text-black mb-2 focus:outline-none focus:ring-2
        {emailError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-[#4a7425]'}"
          />
        </label>
        <label class="flex flex-col text-black">
          Masukkan password yang kuat
          <div class="relative gap-2">
            <input
              type={showPassword ? "text" : "password"}
              id="pass"
              name="pass"
              bind:value={emailPass}
              placeholder="Student@2026"
              class="w-full mt-2 rounded-lg border px-3 py-2.5 text-sm text-gray-900 mb-2 focus:outline-none focus:ring-2
        {passError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-[#4a7425]'}"
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              hidden={!emailPass}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {#if showPassword === false}
                <Eye />
              {:else}
                <EyeOff />
              {/if}
            </button>
          </div></label
        >

        {#if emailError != null || passError != null}
          <p class="text-sm">{passError}</p>
          <p class="text-sm">{emailError}</p>
        {/if}

        <!-- Cloudflare Turnstile Implementation for extra bot mitigation on top of cloudflare's cdn -->
        <TurnstileWidget
          onVerify={(token) => (turnstileToken = token)}
          bind:this={turnstile}
        />

        <!-- vvv loading anim-->
        <button
          type="submit"
          value="Submit"
          class="bg-[#4a7425] text-white font-semibold text-base px-6 py-3.5 rounded-xl shadow-lg cursor-pointer
						       hover:bg-[#3d5f1f] transition-all transform hover:-translate-y-1 active:translate-y-0
						       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full
                  "
        >
          {#if signUpStatus === true}
            <span class="loading loading-spinner loading-sm"></span>
            Melog masuk...
          {:else}
            Log Masuk
          {/if}
        </button>
      </form>
      <a href="/forgot_password" class="text-xs text-gray-500 hover:underline">
        Lupa kata laluan? Tekan saya untuk tukar kata laluan.
      </a>
      <p class="text-xs text-gray-500 text-center mt-1 leading-relaxed">
        Tiada google? Boleh gunakan email.
      </p>
      <a
        href="/sign_up"
        class="bg-[#4a7425] text-white font-semibold text-base px-1.5 py-2 rounded-xl pointer-events-auto shadow-lg
						       hover:bg-[#3d5f1f] transition-all transform hover:-translate-y-1 active:translate-y-0
						       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full"
      >
        Buat akaun baharu
      </a>

      <hr class="opacity-10" />
      <!-- <p class="text-xs text-gray-400 text-center mt-3.5 leading-relaxed">ATAU</p> -->
      <button
        onclick={signInWithGoogle}
        class="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center cursor-pointer gap-3"
      >
        <svg class="w-5 h-5" viewBox="0 0 48 48">
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
            c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
            c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          />
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039
            l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
            c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          />
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
            c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          />
        </svg>
        Log Masuk Melalui Google
      </button>
    </div>
  </div>
</div>
