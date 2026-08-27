<!-- src/routes/forgot_password -->

<script lang="ts">
  import TurnstileWidget from "$lib/turnstileWidget.svelte";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";

  let redirectSeconds = $state(0);
  let turnstile: TurnstileWidget | undefined = $state();
  let { form } = $props();
  let signUpStatus = $state(false);
  let emailInput = $state("");
  let turnstileToken = $state("");

  if (turnstileToken) {
    console.log(0);
  }
  export function redirectAfterSignup() {
    redirectSeconds = 5;
    const timer = setInterval(() => {
      redirectSeconds -= 1;
      if (redirectSeconds <= 0) {
        clearInterval(timer);
        goto(resolve("/login"));
      }
    }, 1000);
    return timer;
  }

  $effect(() => {
    if (form?.success) {
      const timer = redirectAfterSignup();
      return () => clearInterval(timer);
    }
  });
</script>

<svelte:head>
  <title>Lupa kata laluan - Akademi Abang Rumah</title>
  <meta
    name="description"
    content="Tetapkan semula kata laluan akaun Akademi Abang Rumah anda"
  />
</svelte:head>

<link rel="preconnect" href="https://challenges.cloudflare.com" />

<div
  class="min-h-dvh flex items-center justify-center bg-[#FAF9F5] px-4"
  style="padding-top: max(1.5rem, env(safe-area-inset-top)); padding-bottom: max(1.5rem, env(safe-area-inset-bottom));"
>
  <div class="w-full max-w-[400px]">
    <!-- brand mark -->
    <div class="flex flex-col items-center mb-8">
      <div
        class="w-12 h-12 rounded-2xl bg-[#4a7425] flex items-center justify-center text-white font-bold text-lg mb-3"
      >
        AR
      </div>
      <h1 class="text-[22px] font-semibold text-gray-900">Lupa kata laluan</h1>
      <p class="text-[14px] text-gray-500 mt-1 text-center">
        Masukkan email anda dan kami akan hantar pautan untuk tetapkan semula
      </p>
    </div>

    <div
      class="bg-white rounded-3xl border border-gray-200 px-5 py-6 sm:px-7 sm:py-7"
    >
      {#if form?.success === true}
        <div
          class="flex items-start gap-2.5 rounded-2xl bg-green-50 text-green-700 text-[13.5px] leading-relaxed px-4 py-3.5"
        >
          <span class="font-semibold shrink-0">✓</span>
          <span>
            Sila semak email anda untuk pautan menukar kata laluan. Anda akan
            dialihkan ke halaman log masuk dalam {redirectSeconds} saat.
          </span>
        </div>
      {:else}
        {#if form?.emailError}
          <div
            class="flex items-start gap-2.5 rounded-2xl bg-red-50 text-red-700 text-[13.5px] leading-relaxed px-4 py-3 mb-5"
          >
            <span class="font-semibold shrink-0">!</span>
            <span>{form.emailError}</span>
          </div>
        {/if}

        <form
          method="POST"
          use:enhance={() => {
            signUpStatus = true;
            return async ({ update, result }) => {
              signUpStatus = false;
              if (result.type === "failure") {
                turnstile?.reset();
              }
              await update();
            };
          }}
        >
          <label class="block mb-5">
            <span class="block text-[13.5px] font-medium text-gray-700 mb-1.5">
              Email
            </span>
            <input
              type="email"
              name="email"
              bind:value={emailInput}
              required
              placeholder="studentabangrumah@gmail.com"
              autocomplete="email"
              inputmode="email"
              class="w-full rounded-2xl border px-4 text-[16px] text-gray-900 outline-none transition-colors placeholder:text-gray-400
              focus:ring-2
              {form?.emailError
                ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400'
                : 'border-gray-200 focus:ring-[#4a7425]/25 focus:border-[#4a7425]'}"
              style="height: 52px;"
            />
          </label>

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
            {#if signUpStatus}
              <span class="loading loading-spinner loading-sm"></span>
              Menghantar permintaan...
            {:else}
              Mohon penukaran
            {/if}
          </button>
        </form>
      {/if}
    </div>

    <p class="text-center text-[13.5px] text-gray-500 mt-6">
      Teringat kata laluan?
      <a
        href={resolve("/login")}
        class="text-[#4a7425] font-medium hover:underline"
      >
        Log masuk
      </a>
    </p>
  </div>
</div>
