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
  let bannerMessage = $derived(errorMessage || passError || emailError);

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

<div
  class="min-h-dvh flex items-center justify-center bg-[#FAF9F5] px-4"
  style="padding-top: max(1.5rem, env(safe-area-inset-top)); padding-bottom: max(1.5rem, env(safe-area-inset-bottom));"
>
  <div class="w-full max-w-[400px]">
    <!-- brand mark -->
    <div class="flex flex-col items-center mb-8">
      <h1 class="text-[22px] font-semibold text-gray-900">Log masuk</h1>
      <p class="text-[14px] text-gray-500 mt-1 text-center">
        Selamat kembali ke Akademi Abang Rumah
      </p>
    </div>

    <div
      class="bg-white rounded-3xl border border-gray-200 px-5 py-6 sm:px-7 sm:py-7"
    >
      {#if bannerMessage}
        <div
          class="flex items-start gap-2.5 rounded-2xl bg-red-50 text-red-700 text-[13.5px] leading-relaxed px-4 py-3 mb-5"
        >
          <span class="font-semibold shrink-0">!</span>
          <span>{bannerMessage}</span>
        </div>
      {/if}

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
        <label class="block mb-4">
          <span class="block text-[13.5px] font-medium text-gray-700 mb-1.5">
            Email
          </span>
          <input
            type="email"
            id="email"
            name="email"
            bind:value={emailInput}
            placeholder="studentabangrumah@gmail.com"
            autocomplete="email"
            inputmode="email"
            class="w-full rounded-2xl border px-4 text-[16px] text-gray-900 outline-none transition-colors placeholder:text-gray-400
            focus:ring-2
            {emailError
              ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400'
              : 'border-gray-200 focus:ring-[#4a7425]/25 focus:border-[#4a7425]'}"
            style="height: 52px;"
          />
        </label>

        <label class="block mb-2">
          <span class="block text-[13.5px] font-medium text-gray-700 mb-1.5">
            Kata laluan
          </span>
          <div class="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="pass"
              name="pass"
              bind:value={emailPass}
              placeholder="Student@2026"
              autocomplete="current-password"
              class="w-full rounded-2xl border px-4 pr-12 text-[16px] text-gray-900 outline-none transition-colors placeholder:text-gray-400
              focus:ring-2
              {passError
                ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400'
                : 'border-gray-200 focus:ring-[#4a7425]/25 focus:border-[#4a7425]'}"
              style="height: 52px;"
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              hidden={!emailPass}
              aria-label={showPassword
                ? "Sembunyikan kata laluan"
                : "Papar kata laluan"}
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-10 h-10 flex items-center justify-center"
            >
              {#if showPassword === false}
                <Eye size={19} />
              {:else}
                <EyeOff size={19} />
              {/if}
            </button>
          </div>
        </label>

        <div class="flex justify-end mb-4">
          <a
            href="/forgot_password"
            class="text-[13.5px] text-gray-500 hover:text-gray-700 py-1"
          >
            Lupa kata laluan?
          </a>
        </div>

        <!-- Cloudflare Turnstile Implementation for extra bot mitigation on top of cloudflare's cdn -->
        <div class="mb-5 flex justify-center">
          <TurnstileWidget
            onVerify={(token) => (turnstileToken = token)}
            bind:this={turnstile}
          />
        </div>

        <button
          type="submit"
          value="Submit"
          disabled={signUpStatus}
          class="w-full flex items-center justify-center gap-2.5 bg-[#4a7425] text-white font-semibold text-[15.5px] rounded-2xl cursor-pointer
          hover:bg-[#3d5f1f] active:scale-[0.98] transition-all
          disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          style="height: 52px;"
        >
          {#if signUpStatus === true}
            <span class="loading loading-spinner loading-sm"></span>
            Melog masuk...
          {:else}
            Log masuk
          {/if}
        </button>
      </form>

      <div class="flex items-center gap-3 my-5 text-gray-400 text-[12px]">
        <div class="flex-1 h-px bg-gray-200"></div>
        ATAU
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>

      <button
        onclick={signInWithGoogle}
        class="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 rounded-2xl font-medium text-[15px]
        hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
        style="height: 52px;"
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
        Log masuk melalui Google
      </button>
    </div>

    <p class="text-center text-[13.5px] text-gray-500 mt-6">
      Belum ada akaun?
      <a href="/sign_up" class="text-[#4a7425] font-medium hover:underline">
        Daftar sekarang
      </a>
    </p>
  </div>
</div>
