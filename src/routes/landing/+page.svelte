<script lang="ts">
  const features = [
    {
      label: "Modul Video",
      description: "Belajar ikut modul, bila-bila masa",
      icon: "▶",
      available: true,
    },
    {
      label: "Nota & PDF",
      description: "Muat turun nota rujukan",
      icon: "📄",
      available: true,
    },
    {
      label: "Checklist Tapak",
      description: "Senarai semak supaya tiada langkah tertinggal",
      icon: "📋",
      available: false,
    },
    {
      label: "Kalkulator",
      description: "Kira anggaran kos bahan & kerja",
      icon: "🧮",
      available: false,
    },
    {
      label: "SOP Kerja",
      description: "Panduan langkah demi langkah kerja tapak",
      icon: "👷",
      available: false,
    },
    {
      label: "Tanya Abang Rumah",
      description: "Soalan & jawapan terus dengan pengajar",
      icon: "💬",
      available: true,
    },
  ];
</script>

<svelte:head>
  <title>Akademi Abang Rumah</title>
  <meta
    name="description"
    content="Aplikasi untuk mengakses panduan dan tunjuk ajar Abang Rumah secara on demand!"
  />
</svelte:head>

<div
  class="min-h-screen bg-gray-50 font-sans overflow-x-hidden flex flex-col anim-fade"
>
  <!-- Main Hero Section -->
  <main class="flex-1 relative flex items-center py-12 lg:py-0">
    <!-- Improved Light Green Background Block -->
    <!-- Added rounded-r-full for a softer, more modern aesthetic -->
    <div
      class="absolute top-12 lg:top-1/4 left-0 w-full lg:w-[80%] h-100 bg-[#7ced67] shadow-sm rounded-r-[3rem] z-0 anim-fly-left delay-200"
    ></div>

    <!-- Content Container -->
    <div
      class="max-w-7xl mx-auto w-full px-6 pt-6 pb-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 min-h-[calc(100vh-80px)]"
    >
      <!-- Left Column: Typography & CTA -->
      <div class="w-full lg:w-3/5 flex flex-col justify-center pt-8 lg:pt-0">
        <div class="anim-fly-up delay-400">
          <h1
            class="text-5xl mb-6 md:text-6xl lg:text-[4rem] font-extrabold text-gray-900 uppercase tracking-tight leading-none"
          >
            BINA RUMAH IDAMAN ANDA
          </h1>
          <p
            class="text-xl md:text-2xl text-gray-800 font-medium max-w-xl leading-relaxed"
          >
            Mahu belajar buat rumah sendiri? Mahu elakkan helah kontraktor tak
            bertauliah? Mari belajar buat rumah bersama Abang Rumah!
          </p>
        </div>

        <!-- Call to Action -->
        <!-- Moved out of the green block visually and tied color to the navbar for cohesion -->
        <div class="mt-8 lg:mt-10 anim-fly-up delay-600">
          <a
            href="/login"
            class="inline-block bg-[#2d4a22] hover:bg-[#1a2f13] transition-all duration-300 text-white text-xl lg:text-2xl font-semibold py-5 px-10 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 max-w-lg text-center leading-tight border-2 border-transparent hover:border-[#7ced67]"
          >
            Mula belajar sekarang!
          </a>
        </div>
      </div>

      <!-- Right Column: Mobile App Screenshot -->
      <div
        class="w-full lg:w-2/5 flex justify-center top-3 lg:justify-end anim-fly-right delay-800"
      >
        <!-- Sleek CSS Device Frame -->
        <div class="relative bg-black mockup-phone border-[#A9B689]">
          <div class="mockup-phone-camera"></div>
          <div class="mockup-phone-display">
            <img
              src="/assets/images/image.webp"
              alt="Akademi Abang Rumah App Screenshot"
              fetchpriority="high"
            />
            <!-- Optional: Simulated iPhone Notch
            <div
              class="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1f2937] rounded-b-2xl z-10"
            ></div> -->
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Credibility Section — same person/photo as /about, trimmed down.
         Trust matters a lot for this audience (wary of contractor scams),
         so this sits right after the hero, before anything else. -->
  <section class="bg-white py-16 lg:py-24 relative z-10">
    <div
      class="max-w-5xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12"
    >
      <div class="w-full lg:w-2/5 flex justify-center anim-fly-left">
        <img
          src="/assets/images/en ayub self portrait.webp"
          alt="En Ayub - Abang Rumah"
          class="w-full max-w-sm rounded-2xl shadow-xl object-cover"
        />
      </div>
      <div class="w-full lg:w-3/5 anim-fly-right">
        <p
          class="text-sm font-bold text-[#4a7425] uppercase tracking-wide mb-2"
        >
          Kenali Pengajar Anda
        </p>
        <h2 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
          En Ayub, Abang Rumah
        </h2>
        <p class="text-lg text-gray-600 leading-relaxed mb-6">
          Pengasas dan pengajar Akademi Abang Rumah, dengan pengalaman
          bertahun-tahun sebagai profesional dalam bidang pembinaan. Berkomitmen
          menyediakan kandungan pembelajaran yang berkualiti tinggi dan relevan
          — supaya anda boleh bina rumah sendiri dengan yakin, jimat, dan tanpa
          ditipu kontraktor tak bertauliah.
        </p>
        <a
          href="/about"
          class="inline-flex items-center gap-1 text-[#2d4a22] font-semibold hover:gap-2 transition-all"
        >
          Baca lebih lanjut mengenai En Ayub ›
        </a>
      </div>
    </div>
  </section>
  <!-- Feature grid — mirrors the actual home page tiles 1:1, so what's
         pitched here is exactly what a new student sees after logging in.
         "Akan Datang" badges kept honest rather than overselling. -->
  <section class="bg-gray-50 py-16 lg:py-24 relative z-10">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-12 anim-fly-up-sm">
        <p
          class="text-sm font-bold text-[#4a7425] uppercase tracking-wide mb-2"
        >
          Apa Yang Anda Dapat
        </p>
        <h2 class="text-3xl lg:text-4xl font-extrabold text-gray-900">
          Semua Dalam Satu Aplikasi
        </h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
        {#each features as feature, i}
          <div
            class="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center gap-2 relative hover:shadow-md transition anim-fly-up-card"
            style="animation-delay: {100 * i}ms"
          >
            {#if !feature.available}
              <span
                class="absolute top-2 right-2 text-[9px] font-semibold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full"
              >
                Akan Datang
              </span>
            {/if}
            <span
              class="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-[#4a7425] text-2xl"
            >
              {feature.icon}
            </span>
            <span class="font-bold text-gray-900">{feature.label}</span>
            <span class="text-sm text-gray-500">{feature.description}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Closing CTA — final nudge after the feature grid, before any footer. -->
  <section class="bg-[#2d4a22] py-16 lg:py-20 relative z-10">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h2 class="text-3xl lg:text-4xl font-extrabold text-white mb-4">
        Jangan Tunggu Lagi, Mula Belajar Hari Ini
      </h2>
      <p class="text-lg text-gray-200 mb-8 leading-relaxed">
        Belajar bina rumah sendiri bersama Abang Rumah — jimat kos, elak ditipu
        kontraktor tak bertauliah, dan bina dengan yakin.
      </p>
      <a
        href="/login"
        class="inline-block bg-[#7ced67] hover:bg-[#65d452] transition-all duration-300 text-[#1a2f13] text-lg lg:text-xl font-semibold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 text-center leading-tight"
      >
        Mula belajar sekarang!
      </a>
    </div>
  </section>
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes flyInLeft {
    from {
      opacity: 0;
      transform: translateX(-60px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @keyframes flyInRight {
    from {
      opacity: 0;
      transform: translateX(60px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @keyframes flyInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .anim-fade {
    animation: fadeIn 600ms ease-out both;
  }
  .anim-fly-left {
    animation: flyInLeft 800ms ease-out both;
  }
  .anim-fly-right {
    animation: flyInRight 800ms ease-out both;
  }
  .anim-fly-up {
    animation: flyInUp 800ms ease-out both;
  }
  .anim-fly-up-sm {
    animation: flyInUp 700ms ease-out both;
  }
  .anim-fly-up-card {
    animation: flyInUp 500ms ease-out both;
  }
  .delay-100 {
    animation-delay: 100ms;
  }
  .delay-200 {
    animation-delay: 200ms;
  }
  .delay-300 {
    animation-delay: 300ms;
  }
  .delay-400 {
    animation-delay: 400ms;
  }
  .delay-600 {
    animation-delay: 600ms;
  }
  .delay-800 {
    animation-delay: 800ms;
  }

  /* Respect users who've asked for reduced motion, and guarantee
     content is visible even if animations fail to fire for any reason. */
  @media (prefers-reduced-motion: reduce) {
    .anim-fade,
    .anim-fly-left,
    .anim-fly-right,
    .anim-fly-up,
    .anim-fly-up-sm,
    .anim-fly-up-card {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
</style>
