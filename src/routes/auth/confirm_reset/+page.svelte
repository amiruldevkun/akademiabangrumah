<!-- src/routes/auth/confirm_reset/+page.svelte -->
<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  let submitting = $state(false);

  const token_hash = page.url.searchParams.get("token_hash") ?? "";
  const type = page.url.searchParams.get("type") ?? "";
  const linkValid = !!token_hash && type === "recovery";
</script>

<svelte:head>
  <title>Sahkan Tetapan Semula - Akademi Abang Rumah</title>
  <meta
    name="description"
    content="Sahkan permintaan tetapan semula password anda."
  />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div class="card w-full max-w-sm bg-base-100 shadow-md">
    <div class="card-body items-center text-center gap-1">
      <div class="flex items-center justify-center gap-3 mb-2">
        <img
          src="/assets/images/akademilogov2.webp"
          alt="Akademi Abang Rumah Logo"
          class="w-12 h-auto"
        />
      </div>

      <h1 class="text-2xl font-bold text-[#4a7425]">Sahkan Tetapan Semula</h1>

      {#if !linkValid}
        <div role="alert" class="alert alert-error mt-4 text-sm text-left">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <span>
            Pautan tidak sah atau tidak lengkap. Sila mohon pautan tetapan
            semula password yang baharu.
          </span>
        </div>

        <a
          href={resolve("/forgot_password")}
          class="btn mt-6 w-full bg-[#4a7425] text-white border-none hover:bg-[#3d5f1f]"
        >
          Mohon Pautan Baharu
        </a>
      {:else}
        <p class="text-sm text-gray-600 mt-2 mb-4 leading-relaxed">
          Klik butang di bawah untuk sahkan permintaan tetapan semula password
          anda dan teruskan.
        </p>

        <form
          method="POST"
          action="/auth/confirm"
          class="w-full"
          onsubmit={() => {
            submitting = true;
          }}
        >
          <input type="hidden" name="token_hash" value={token_hash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value="/auth/reset_password" />

          <!--
            TURNSTILE SKELETON
            Uncomment once verified working with a plain form POST
            (see /auth/confirm/+server.ts for the matching server-side
            verification block, also left commented out).

            <div class="my-4 flex justify-center">
              <TurnstileWidget
                bind:this={turnstile}
                onVerify={(token) => (turnstileToken = token)}
              />
            </div>
          -->

          <button
            type="submit"
            disabled={submitting}
            class="btn mt-2 w-full bg-[#4a7425] text-white border-none font-semibold
                   text-base py-3.5 h-auto rounded-xl shadow-lg hover:bg-[#3d5f1f]
                   transition-all transform hover:-translate-y-1 active:translate-y-0
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {#if submitting}
              <span class="loading loading-spinner loading-sm"></span>
              Mengesahkan...
            {:else}
              Sahkan Tetapan Semula Kata Laluan
            {/if}
          </button>
        </form>
      {/if}

      <p class="text-xs text-gray-400 text-center mt-4 leading-relaxed">
        Teringat password? <a href={resolve("/login")} class="font-bold"
          >Klik saya untuk log masuk</a
        >
      </p>
    </div>
  </div>
</div>
