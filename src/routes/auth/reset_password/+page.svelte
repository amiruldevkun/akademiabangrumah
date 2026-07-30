<script lang="ts">
  import { goto } from "$app/navigation";
  import { Eye, EyeOff } from "@lucide/svelte";
  import { supabase } from "$lib/supabaseClient";
  import { fail } from "@sveltejs/kit";
  let redirectSeconds = $state(0);
  let signUpStatus = $state(false);
  let emailPass = $state("");
  let showPassword = $state(false);
  let passError = $state("");
  let success = $state(false);
  let confirmPass = $state("");

  export async function updateCreds() {
    let message = $state("");
    if (emailPass !== confirmPass) {
      passError = "Kata laluan tidak sama. Perbetulkan";
      return console.error(() => "Password is not the same");
    }

    const { data, error } = await supabase.auth.updateUser({
      password: emailPass,
    });

    if (error?.message?.includes("different")) {
      passError = "Kata laluan sama seperti sebelumnya. Tukar kata laluan.";
      message = "Password must be different than the previous";
      return console.error(() => message);
    } else {
      console.warn("Password for " + data.user + " has been changed!");
    }
    await supabase.auth.signOut();
    return (success = true);
  }

  export function redirectAfterSignup() {
    redirectSeconds = 3;
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
    if (success) {
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
      {#if success}
        <p class="text-green-700 text-sm">
          Kata laluan anda telah ditukar! <br />
          Anda akan dialihkan ke page login dalam {redirectSeconds} dan gunakan kata
          laluan baharu
        </p>
      {:else}
        <form method="POST">
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
                  bind:value={confirmPass}
                  required
                  class="w-full mt-4 rounded-lg border px-3 py-2.5 text-sm text-gray-900 mb-4 focus:outline-none focus:ring-2
                  {passError
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
          {/if}

          <button
            type="button"
            onclick={updateCreds}
            class="bg-[#4a7425] text-white mt-3 font-semibold text-base px-6 py-3.5 rounded-xl shadow-lg
                      hover:bg-[#3d5f1f] transition-all transform hover:-translate-y-1 active:translate-y-0
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full pointer-events-auto"
          >
            {signUpStatus ? "Menukar password" : "Tukar Password"}
          </button>
        </form>
      {/if}
    </div>
    <p class="text-xs text-gray-400 text-center mt-3.5 leading-relaxed">
      Teringat password? <a href="/login" class="font-bold"
        >Klik saya untuk log masuk</a
      >
    </p>
  </div>
</div>
