<script lang="ts">
  import { page } from "$app/state";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { Eye, EyeOff } from "@lucide/svelte";
  import TurnstileWidget from "$lib/turnstileWidget.svelte";

  let turnstileToken = $state("");
  let turnstile: TurnstileWidget | undefined = $state();

  let errorMessage = $derived(page.url.searchParams.get("error"));
  let emailName = $state("");
  let emailInput = $state("");
  let emailPass = $state("");
  let showPassword = $state(false);
  let redirectSeconds = $state(0);
  let { form } = $props();
  let signUpStatus = $state(false);

  let bannerMessage = $derived(
    errorMessage || form?.passError || form?.emailError,
  );

  export function redirectAfterSignup() {
    redirectSeconds = 5;
    const timer = setInterval(() => {
      redirectSeconds -= 1;
      if (redirectSeconds <= 0) {
        clearInterval(timer);
        goto("/login");
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
  <title>Sign Up - Akademi Abang Rumah</title>
  <meta
    name="description"
    content="Buat akaun untuk meminta akses ke platform Akademi Abang Rumah jika sudah bayar"
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
      <h1 class="text-[22px] font-semibold text-gray-900">Buat akaun</h1>
      <p class="text-[14px] text-gray-500 mt-1 text-center">
        Daftar untuk mula belajar di Akademi Abang Rumah
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
            Sila semak email anda untuk sahkan akaun sebelum log masuk. Anda
            akan dialihkan ke halaman log masuk dalam {redirectSeconds}
            saat.
          </span>
        </div>
      {:else}
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
              signUpStatus = false;
              if (result.type === "failure") {
                turnstile?.reset();
              }
              await update();
            };
          }}
        >
          <label class="block mb-4">
            <span class="block text-[13.5px] font-medium text-gray-700 mb-1.5">
              Nama
            </span>
            <input
              type="text"
              name="name"
              bind:value={emailName}
              required
              placeholder="Student Abang Rumah"
              autocomplete="name"
              class="w-full rounded-2xl border border-gray-200 px-4 text-[16px] text-gray-900 outline-none transition-colors placeholder:text-gray-400
              focus:ring-2 focus:ring-[#4a7425]/25 focus:border-[#4a7425]"
              style="height: 52px;"
            />
          </label>

          <label class="block mb-4">
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

          <label class="block mb-4">
            <span class="block text-[13.5px] font-medium text-gray-700 mb-1.5">
              Kata laluan
            </span>
            <div class="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                bind:value={emailPass}
                required
                placeholder="Student@2026"
                autocomplete="new-password"
                class="w-full rounded-2xl border px-4 pr-12 text-[16px] text-gray-900 outline-none transition-colors placeholder:text-gray-400
                focus:ring-2
                {form?.passError
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

          {#if emailPass}
            <label class="block mb-2">
              <span
                class="block text-[13.5px] font-medium text-gray-700 mb-1.5"
              >
                Ulang kata laluan
              </span>
              <div class="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="conPass"
                  required
                  autocomplete="new-password"
                  class="w-full rounded-2xl border px-4 pr-12 text-[16px] text-gray-900 outline-none transition-colors placeholder:text-gray-400
                  focus:ring-2
                  {form?.passError
                    ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400'
                    : 'border-gray-200 focus:ring-[#4a7425]/25 focus:border-[#4a7425]'}"
                  style="height: 52px;"
                />
                <button
                  type="button"
                  onclick={() => (showPassword = !showPassword)}
                  aria-label={showPassword
                    ? "Sembunyikan kata laluan"
                    : "Papar kata laluan"}
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-10 h-10 flex items-center justify-center cursor-pointer"
                >
                  {#if showPassword === false}
                    <Eye size={19} />
                  {:else}
                    <EyeOff size={19} />
                  {/if}
                </button>
              </div>
            </label>
          {/if}

          <!-- Cloudflare Turnstile Implementation for extra bot mitigation on top of cloudflare's cdn -->
          <div class="mb-5 mt-4 flex justify-center">
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
              Mendaftar...
            {:else}
              Daftar akaun
            {/if}
          </button>
        </form>
      {/if}
    </div>

    <p class="text-center text-[13.5px] text-gray-500 mt-6">
      Sudah ada akaun?
      <a href="/login" class="text-[#4a7425] font-medium hover:underline">
        Log masuk
      </a>
    </p>
  </div>
</div>
