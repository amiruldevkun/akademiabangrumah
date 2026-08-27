<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  let status = $derived(page.status);

  type ErrorContent = {
    eyebrow: string;
    title: string;
    body: string;
  };

  let content: ErrorContent = $derived.by(() => {
    if (status === 404) {
      return {
        eyebrow: "404",
        title: "Halaman tidak dijumpai",
        body: "Pautan yang anda ikuti mungkin sudah tidak wujud, atau alamatnya tersalah taip.",
      };
    }
    if (status === 403) {
      return {
        eyebrow: "403",
        title: "Akses tidak dibenarkan",
        body: "Anda tidak mempunyai kebenaran untuk melihat halaman ini. Log masuk dengan akaun yang betul, atau hubungi kami jika ini satu kesilapan.",
      };
    }
    if (status === 401) {
      return {
        eyebrow: "401",
        title: "Sila log masuk",
        body: "Sesi anda telah tamat atau anda belum log masuk. Log masuk semula untuk teruskan.",
      };
    }
    if (status >= 500) {
      return {
        eyebrow: String(status),
        title: "Sesuatu tidak kena di pihak kami",
        body: "Pelayan kami menghadapi masalah buat sementara waktu. Cuba muat semula halaman ini sebentar lagi.",
      };
    }
    return {
      eyebrow: String(status),
      title: "Sesuatu tidak kena",
      body: "Kami tidak dapat memuatkan halaman ini. Cuba lagi, atau kembali ke laman utama.",
    };
  });
</script>

<svelte:head>
  <title>{content.eyebrow} - Akademi Abang Rumah</title>
</svelte:head>

<div
  class="min-h-dvh flex items-center justify-center bg-[#FAF9F5] px-4"
  style="padding-top: max(1.5rem, env(safe-area-inset-top)); padding-bottom: max(1.5rem, env(safe-area-inset-bottom));"
>
  <div class="w-full max-w-[400px] text-center">
    <div
      class="w-12 h-12 rounded-2xl bg-[#4a7425] flex items-center justify-center text-white font-bold text-lg mb-6 mx-auto"
    >
      AR
    </div>

    <div
      class="bg-white rounded-3xl border border-gray-200 px-6 py-8 sm:px-8 sm:py-9"
    >
      <span
        class="inline-block text-[13px] font-semibold tracking-wide text-[#4a7425] bg-[#4a7425]/10 rounded-full px-3 py-1 mb-4"
      >
        {content.eyebrow}
      </span>

      <h1 class="text-[20px] font-semibold text-gray-900 mb-2">
        {content.title}
      </h1>

      <p class="text-[14px] text-gray-500 leading-relaxed mb-7">
        {content.body}
      </p>

      <div class="flex flex-col gap-3">
        <a
          href={resolve("/")}
          class="w-full flex items-center justify-center bg-[#4a7425] text-white font-semibold text-[15px] rounded-2xl cursor-pointer
          hover:bg-[#3d5f1f] active:scale-[0.98] transition-all"
          style="height: 48px;"
        >
          Kembali ke laman utama
        </a>

        {#if status >= 500}
          <button
            onclick={() => location.reload()}
            class="w-full flex items-center justify-center bg-white text-gray-700 border border-gray-200 rounded-2xl font-medium text-[14.5px]
            hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
            style="height: 48px;"
          >
            Muat semula
          </button>
        {/if}
      </div>
    </div>

    <p class="text-center text-[13px] text-gray-400 mt-6">
      Perlukan bantuan? <a
        href="mailto:support@akademiabangrumah.com"
        class="text-[#4a7425] font-medium hover:underline">Hubungi kami</a
      >
    </p>
  </div>
</div>
