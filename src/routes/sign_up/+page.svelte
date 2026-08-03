<script lang="ts">
  import { page } from "$app/state";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { Eye } from "@lucide/svelte";
  import { EyeOff } from "@lucide/svelte";

  let errorMessage = $derived(page.url.searchParams.get("error"));
  let emailName = $state("");
  let emailInput = $state("");
  let emailPass = $state("");
  let showPassword = $state(false);
  let redirectSeconds = $state(0);
  let { form } = $props();
  let signUpStatus = $state(false);

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

<div class="max-h-screen flex items-center justify-center bg-gray-50">
  <div class="bg-white p-8 rounded-lg shadow-md text-center">
    <!-- Title + logo side by side -->
    <div class="flex items-center justify-center gap-3 mb-6">
      <h1 class="text-2xl font-bold text-[#4a7425]">Sign Up</h1>
    </div>

    {#if errorMessage}
      <p class="text-red-600 text-sm mb-4">{errorMessage}</p>
    {/if}

    <div class="flex flex-col">
      {#if form?.success}
        <p class="text-green-700 text-sm">
          Sila semak email anda untuk sahkan akaun sebelum log masuk. <br />
          Anda akan dialihkan ke page login dalam {redirectSeconds}
        </p>
      {:else}
        <form
          method="POST"
          use:enhance={() => {
            signUpStatus = true;
            return async ({ update }) => {
              signUpStatus = false;
              await update();
            };
          }}
        >
          <label class="flex flex-col">
            <div class="relative gap-1">
              Masukkan nama anda
              <input
                type="text"
                name="name"
                bind:value={emailName}
                required
                placeholder="Student Abang Rumah"
                class="w-full mt-2 mb-2 rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2
            "
              />
            </div>
          </label>
          <br />
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
          <label class="flex flex-col">
            Masukkan password yang kuat
            <div class="relative gap-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                bind:value={emailPass}
                required
                placeholder="Student@2026"
                class="w-full mt-2 rounded-lg border px-3 py-2.5 text-sm text-gray-900 mb-2 focus:outline-none focus:ring-2
                {form?.passError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[#4a7425]'}"
              />
              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {#if showPassword === false}
                  <Eye />
                {:else}
                  <EyeOff />
                {/if}
              </button>
            </div>
          </label>

          {#if emailPass}
            <br />
            <label class="flex flex-col">
              Ulang password yang di masukkan tadi
              <div class="relative gap-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="conPass"
                  required
                  class="w-full mt-4 rounded-lg border px-3 py-2.5 text-sm text-gray-900 mb-4 focus:outline-none focus:ring-2
                  {form?.passError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#4a7425]'}"
                />
                <button
                  type="button"
                  onclick={() => (showPassword = !showPassword)}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                >
                  {#if showPassword === false}
                    <Eye />
                  {:else}
                    <EyeOff />
                  {/if}
                </button>
              </div>
            </label>
          {/if}

          {#if form?.emailError != null || form?.passError != null}
            <p class="text-sm">{form?.passError}</p>
            <p class="text-sm">{form?.emailError}</p>
          {/if}
          <!-- vvv loading anim-->
          <button
            type="submit"
            value="Submit"
            class="bg-[#4a7425] text-white mt-3 font-semibold text-base px-6 py-3.5 rounded-xl shadow-lg
                      hover:bg-[#3d5f1f] transition-all transform hover:-translate-y-1 active:translate-y-0
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full cursor-pointer"
          >
            {signUpStatus ? "Signing up" : "Sign Up"}
          </button>
        </form>
      {/if}
    </div>
    <p class="text-xs text-gray-400 text-center mt-3.5 leading-relaxed">
      Sudah ada akaun? <a href="/login" class="font-bold"
        >Klik saya untuk log masuk</a
      >
    </p>
  </div>
</div>
