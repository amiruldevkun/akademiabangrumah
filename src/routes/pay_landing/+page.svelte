<script lang="ts">
  // pay_landing/+page.svelte
  import {
    product_name,
    product_description,
    product_amountRM,
  } from "$lib/productMeta.json";
  import { resolve } from "$app/paths";
  let { data } = $props();

  let name = $state(data.suggestedName ?? "");
  let phone = $state("");
  let submitting = $state(false);

  let errorMsg = $state("");

  const PRODUCT = {
    name: product_name,
    tagline: product_description,
    amountRM: product_amountRM,
  };

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    errorMsg = "";
    submitting = true;
    try {
      const res = await fetch("/api/create-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) throw new Error("Could not start checkout");
      const result = await res.json();

      if (result.alreadyPaid) {
        window.location.href = "/classroom";
        return;
      }

      // result.resumed=true means this is an existing bill being
      // resumed rather than a brand new one — same redirect either way,
      // just noted here in case you want to show different copy later.
      window.location.href = result.paymentUrl;
    } catch (err) {
      console.error(err);
      errorMsg = "Something went wrong starting checkout. Please try again.";
      submitting = false;
    }
  }

  let checkoutHighlighted = $state(false);

  function highlightForm() {
    document
      .getElementById("checkout-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

    checkoutHighlighted = true;
    setTimeout(() => {
      checkoutHighlighted = false;
    }, 1500);
  }
  const modules = [
    "Persediaan sebelum membina rumah",
    "Proses pelan dan kelulusan",
    "Kerja tapak dan asas rumah",
    "Ground beam dan struktur",
    "Kerja dinding dan bumbung",
    "Kerja elektrik dan paip",
    "Kerja kemasan",
    "Cara memantau kerja kontraktor",
    "Kesilapan yang menyebabkan kerugian",
    "Proses sehingga serahan kunci",
  ];
</script>

<svelte:head>
  <title>Payment - Akademi Abang Rumah</title>
</svelte:head>

<main class="min-h-screen bg-gray-50">
  <div
    class="max-w-6xl mx-auto px-6 py-16 grid gap-12 lg:grid-cols-[1.6fr_1fr] items-start"
  >
    <!-- Left column: all marketing content -->
    <section class="space-y-20">
      <!-- Header Hero -->
      <div class="text-center">
        <div
          class="inline-block bg-[#4a7425] text-white font-semibold text-lg px-2 py-2 rounded-xl shadow-lg mb-8"
        >
          <img
            src="/assets/images/poster aar cta.webp"
            alt="AAR CTA Poster"
            class="w-full max-w-md rounded-lg shadow-lg"
          />
        </div>
        <h1
          class="text-3xl sm:text-4xl font-extrabold text-red-600 mb-4 tracking-tight"
        >
          TAKUT KENA TIPU KONTRAKTOR PULUHAN RIBU??
        </h1>
        <p class="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
          {PRODUCT.tagline}
        </p>
      </div>

      <!-- Harga & CTA Utama -->
      <div
        class="bg-yellow-300 border-2 border-dotted border-black p-8 rounded-xl text-center shadow-lg"
      >
        <h2 class="text-2xl font-extrabold mb-2">
          Harga Pengenalan RM{PRODUCT.amountRM} Sahaja
        </h2>
        <p class="font-bold text-lg mb-6">
          Daftar sekarang dan dapatkan akses segara ke video panduan group
          support VIP. Slot EarlyBird terhad 100 orang terawal sahaja!
        </p>
        <button
          type="button"
          onclick={highlightForm}
          class="inline-block bg-[#4a7425] text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-[#3d5f1f] transition shadow-md"
        >
          YA, SAYA NAK SERTAI AKADEMI ABANG RUMAH
        </button>
      </div>

      <!-- Masalah -->
      <div class="bg-red-600 text-white p-8 rounded-xl shadow-md">
        <h3 class="text-xl font-bold mb-4 underline">
          Pernah alami masalah ini?
        </h3>
        <ul class="space-y-3">
          {#each ["Tak tahu proses bina rumah dari awal", "Takut ditipu kontraktor", "Tak tahu harga sebenar kerja pembinaan", "Tak tahu kerja mana yang perlu dipantau", "Tak pandai membaca pelan", "Tak tahu bagaimana mengelakkan kerugian"] as item (item)}
            <li class="flex items-center gap-2"><span>❌</span> {item}</li>
          {/each}
        </ul>
        <p class="mt-6 font-bold">
          Jika salah satu di atas pernah berlaku, modul ini dibina khas untuk
          membantu abang.
        </p>
      </div>

      <!-- Tentang Abang Rumah -->
      <div class="bg-[#94bd7b] p-8 rounded-xl text-gray-900">
        <h3 class="text-2xl font-bold mb-4">SIAPA ABANG RUMAH?</h3>
        <p class="leading-relaxed">
          Saya Ayub Suleiman. Sepanjang lebih 20 tahun dalam bidang pembinaan,
          saya telah mengumpulkan pengalaman daripada tukang sehingga mengurus
          projek, dan kini saya kongsikan dalam bentuk video untuk mengelakkan
          kerugian besar.
        </p>
      </div>

      <!-- Modul Pembelajaran -->
      <div>
        <h3 class="text-2xl font-bold mb-6">APA YANG ABANG AKAN BELAJAR?</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          {#each modules as mod, i (mod)}
            <div
              class="bg-white p-4 rounded-lg shadow border-l-4 border-[#ff9c00]"
            >
              <span class="font-bold block text-sm text-[#ff9c00] mb-1"
                >Modul {i + 1}</span
              >
              {mod}
            </div>
          {/each}
        </div>
      </div>

      <!-- Bonus & Testimoni -->
      <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h3 class="text-xl font-bold mb-4">BONUS KHAS</h3>
        <ul class="list-disc pl-5 space-y-2">
          <li>Akses Group Support VVIP</li>
          <li>Boleh bertanya terus dengan Abang Rumah</li>
          <li>Video tambahan daripada projek sebenar</li>
          <li>Update ilmu baru sepanjang tempoh akses</li>
        </ul>

        <div class="italic text-gray-700 border-t pt-6 mt-8">
          <h4 class="text-red-600 font-bold text-xl mb-2 not-italic">
            TESTIMONI
          </h4>
          <p>
            "Dari kerja berkuli, akhirnya dapat menyiapkan rumah sendiri dan
            berjimat hampir RM48,300."
          </p>
        </div>
      </div>
    </section>

    <!-- Right column: sticky checkout card -->
    <div
      id="checkout-form"
      class="scroll-mt-8 lg:sticky lg:top-8 rounded-xl transition-all duration-500 {checkoutHighlighted
        ? 'ring-4 ring-[#4a7425] ring-offset-4 ring-offset-gray-50'
        : 'ring-4 ring-transparent ring-offset-4 ring-offset-gray-50'}"
    >
      <form
        onsubmit={submit}
        class="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-1"
      >
        <div class="flex items-baseline justify-between mb-2">
          <span
            class="text-xs font-semibold uppercase tracking-wide text-gray-400"
          >
            Bil kepada
          </span>
          <span class="text-xs font-mono text-gray-400">
            No. {new Date().getFullYear()}-CHK
          </span>
        </div>

        {#if data.userEmail}
          <div
            class="flex-col items-center gap-2 bg-emerald-50 rounded-lg px-3 py-1 mb-5"
          >
            <span class="text-sm font-medium text-gray-700 truncate"
              >{data.userEmail}</span
            >
            <br />
            <span
              class="text-xs font-semibold uppercase tracking-wide text-gray-400"
            >
              Mengikut email log masuk anda
            </span>
          </div>

          <label for="name" class="text-xs font-semibold text-gray-600 mb-1.5">
            Nama penuh
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            required
            placeholder="Nama seperti dalam IC"
            autocomplete="name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 mb-4
						       focus:outline-none focus:ring-2 focus:ring-[#4a7425] focus:border-[#4a7425]"
          />

          <label for="phone" class="text-xs font-semibold text-gray-600 mb-1.5">
            Nombor telefon
          </label>
          <input
            id="phone"
            type="tel"
            bind:value={phone}
            required
            placeholder="01X-XXXXXXX"
            autocomplete="tel"
            class="w-full rounded-lg border border-[#d1d5dc] px-3 py-2.5 text-sm text-gray-900 mb-5
						       focus:outline-none focus:ring-2 focus:ring-[#4a7425] focus:border-[#4a7425]"
          />
        {:else}
          <!-- Anonymous visitor — nothing to attach a payment to yet.
					     No name/phone fields until there's a real session, since
					     /api/create-bill requires one (correctly, server-side). -->
          <p class="text-sm text-gray-600 mb-5 leading-relaxed">
            Log masuk dahulu untuk teruskan pendaftaran. Akaun ini akan
            digunakan untuk sahkan pembayaran dan beri akses terus ke video
            selepas bayaran berjaya.
          </p>
        {/if}

        <div class="flex items-baseline justify-between mb-5">
          <span class="text-sm text-gray-500">Jumlah perlu dibayar</span>
          <span class="text-xl font-mono font-semibold text-gray-900">
            RM {PRODUCT.amountRM.toFixed(2)}
          </span>
        </div>

        {#if errorMsg}
          <p class="text-sm text-red-600 mb-3" role="alert">{errorMsg}</p>
        {/if}

        {#if data.userEmail}
          <button
            type="submit"
            disabled={submitting}
            class="bg-[#4a7425] text-white font-semibold text-base px-6 py-3.5 rounded-xl shadow-lg
						       hover:bg-[#3d5f1f] transition-all transform hover:-translate-y-1 active:translate-y-0
						       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full"
          >
            {submitting ? "Memulakan pembayaran…" : "Bayar melalui ToyyibPay"}
          </button>

          <p class="text-xs text-gray-400 text-center mt-3.5 leading-relaxed">
            Pembayaran selamat dikendalikan oleh ToyyibPay. Anda akan diarahkan
            untuk melengkapkan pembayaran melalui FPX atau kad.
          </p>
        {:else}
          <a
            href={resolve("/login")}
            class="bg-white text-gray-700 border border-gray-300 px-6 py-3.5 rounded-xl font-semibold
						       hover:bg-gray-50 transition flex items-center justify-center gap-3 w-full
						       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Log Masuk
          </a>

          <p class="text-xs text-gray-400 text-center mt-3.5 leading-relaxed">
            Selepas log masuk, anda akan kembali ke sini secara automatik untuk
            lengkapkan pembayaran.
          </p>
        {/if}
      </form>
    </div>
  </div>
</main>
