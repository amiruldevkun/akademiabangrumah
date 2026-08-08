<!-- src/routes/forgot_password -->

<script lang="ts">
  import TurnstileWidget from "$lib/turnstileWidget.svelte";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  let redirectSeconds = $state(0);
  let turnstile: TurnstileWidget | undefined = $state();
  let { form } = $props();
  let signUpStatus = $state(false);
  let emailInput = $state("");
  let turnstileToken = $state("");

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
  <title>Reset Password - Akademi Abang Rumah</title>
  <meta
    name="description"
    content="Buat akaun untuk meminta akses ke platform Akademi Abang Rumah jika sudah bayar"
  />
</svelte:head>

<div class="max-h-screen flex items-center justify-center bg-gray-50">
  <div class="bg-white p-8 rounded-lg shadow-md text-center">
    <!-- Title + logo side by side -->
    <div class="flex items-center justify-center gap-3 mb-6">
      <h1 class="text-2xl font-bold text-[#4a7425]">Reset Password</h1>
    </div>

    <div class="flex flex-col">
      {#if form?.success}
        <p class="text-green-700 text-sm">
          Sila semak email anda untuk menukar password sebelum log masuk. <br />
          Anda akan dialihkan ke page login dalam {redirectSeconds}
        </p>
      {:else}
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
          <label class="flex flex-col">
            <div class="relative gap-1">
              Masukkan email anda
              <input
                type="email"
                name="email"
                bind:value={emailInput}
                required
                placeholder="studentabangrumah@gmail.com"
                class="w-full mt-2 rounded-lg border px-3 py-2.5 text-sm text-gray-900 mb-2 focus:outline-none focus:ring-2
                {form?.emailError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[#4a7425]'}"
              />
            </div>
          </label>
          <br />
          <!-- Cloudflare Turnstile Implementation for extra bot mitigation on top of cloudflare's cdn -->
          <TurnstileWidget onVerify={(token) => (turnstileToken = token)} />

          <button
            type="submit"
            value="Submit"
            class="bg-[#4a7425] text-white mt-3 font-semibold text-base px-6 py-3.5 rounded-xl shadow-lg
                      hover:bg-[#3d5f1f] transition-all transform hover:-translate-y-1 active:translate-y-0
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full pointer-events-auto"
          >
            {signUpStatus ? "Menghantar permintaan" : "Mohon penukaran"}
          </button>
        </form>
      {/if}
      {#if form?.emailError != null}
        <p class="text-sm">{form?.emailError}</p>
      {/if}
    </div>
    <p class="text-xs text-gray-400 text-center mt-3.5 leading-relaxed">
      Teringat password? <a href="/login" class="font-bold"
        >Klik saya untuk log masuk</a
      >
    </p>
  </div>
</div>
