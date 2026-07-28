<script lang='ts'>
  import { supabase } from '$lib/supabaseClient';
  import { page } from '$app/state';
  import { redirect } from '@sveltejs/kit';

  let errorMessage = $derived(page.url.searchParams.get('error'));
  let emailInput = $state('');
  let emailPass = $state('');
  let signUpStatus = $state(false);
  let passError = $state('');
  let emailError = $state('');

  async function signInWithEmail() {
    passError = '';
    emailError = '';
    signUpStatus = true;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: emailPass,
      options: {
        
      }
    })
    console.log(error, data);
    if (error?.message.includes("Password")) {
      passError = "Kata laluan mestilah sepanjang 6 huruf atau/dan memerlukan 1 huruf besar, 1 huruf kecil, 1 simbol(!,@,$) dan 1 nombor";
    }
    else if (error?.message.includes("invalid format")){
      emailError = "Email bukan format yang diingini. Perbetulkan email.";
    }
    else if (error?.message.includes("requires")) {
      passError = "Letakkan kata laluan"
    }
    else if (error?.message.includes("Anonymous")) {
      let message = "Email dan kata laluan kosong"
      passError = message;
      emailError = message;
    }
    else {
      window.location.href="/"
    }
    signUpStatus = false;
  };

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,

        queryParams: {
          prompt: 'select_account'
        }
      }
    });
  };

  async function signUpRedirect() {
    throw redirect(303, "/sign_up")
  }
</script>

<svelte:head>
  <title>Login - Akademi Abang Rumah</title>
  <meta name="description" content="Log masuk ke Akademi Abang Rumah untuk mengakses video oleh Abang Rumah!">
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
      <label class="gap-2">
        Masukkan email anda
        <input type="email" id="mail" bind:value={emailInput} placeholder="studentabangrumah@gmail.com" class="w-full mt-2 rounded-lg border px-3 py-2.5 text-sm text-gray-900 mb-1 focus:outline-none focus:ring-2 
        {emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#4a7425]'}">
      </label>
      <label class="gap-2">
        Masukkan password yang kuat
        <input type="password" id="pass" bind:value={emailPass} placeholder="Student@2026" class="w-full mt-2 rounded-lg border px-3 py-2.5 text-sm text-gray-900 mb-1 focus:outline-none focus:ring-2 
        {passError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#4a7425]'}">
      </label>

      {#if (emailError != null || passError != null)}
        <p class="text-sm">{passError}</p>
        <p class="text-sm">{emailError}</p>
      {/if}
                                                                    <!-- vvv loading anim-->
      <button type="submit" onclick={signInWithEmail} class="bg-[#4a7425] text-white font-semibold text-base px-6 py-3.5 rounded-xl pointer-events-auto shadow-lg
						       hover:bg-[#3d5f1f] transition-all transform hover:-translate-y-1 active:translate-y-0
						       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full pointer-events-auto"> 
        {signUpStatus ? 'Signing in' : 'Sign in'}
      </button>
      <hr class="opacity-10">
      <!-- <p class="text-xs text-gray-400 text-center mt-3.5 leading-relaxed">ATAU</p> -->
      <button
        onclick={signInWithGoogle}
        class="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center pointer-events-auto gap-3"
      >
        <svg class="w-5 h-5" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
            c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
            c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039
            l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
            c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
            c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        Sign In Using Google
      </button>
    </div>
    <p class="text-xs text-gray-400 text-center mt-3.5 leading-relaxed">
      Tiada google? Boleh gunakan email. <a href="/sign_up" class="font-bold">Klik saya untuk buat akaun</a>
		</p>

  </div>
</div>