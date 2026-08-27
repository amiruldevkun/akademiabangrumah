<script lang="ts">
  import { resolve } from "$app/paths";

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
            class="text-5xl mb-2 md:text-6xl lg:text-[4rem] font-extrabold text-gray-900 uppercase tracking-tight leading-none"
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
        <div class="mt-4 lg:mt-10 anim-fly-up delay-600">
          <a
            href={resolve("/login")}
            class="inline-block bg-[#2d4a22] hover:bg-[#1a2f13] transition-all duration-300 text-white text-xl lg:text-2xl font-semibold py-5 px-10 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 max-w-lg text-center leading-tight border-2 border-transparent hover:border-[#7ced67]"
          >
            Mula belajar sekarang!
          </a>
        </div>
      </div>

      <!-- Right Column: Mobile App Screenshot -->
      <div
        class="w-full lg:w-2/5 flex justify-center lg:justify-end anim-fly-right delay-800"
      >
        <div
          class="mockup-phone border-[#2d4a22] border-[6px] shadow-2xl w-[260px] sm:w-[300px] aspect-[9/20]"
        >
          <div class="mockup-phone-camera"></div>
          <div class="mockup-phone-display">
            <img
              src="/assets/images/mobile screenshot.png"
              alt="Akademi Abang Rumah App Screenshot"
              fetchpriority="high"
            />
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
          href={resolve("/about")}
          class="inline-flex items-center gap-1 text-[#2d4a22] font-semibold hover:gap-2 transition-all"
        >
          Baca lebih lanjut mengenai En Ayub ›
        </a>
      </div>
    </div>
  </section>

  <!-- How it works — daisyUI steps component. --color-primary /
         --color-primary-content are scoped locally to match the brand
         green (this project hardcodes hex rather than a daisyUI theme),
         since these are just normal inheriting CSS custom properties. -->
  <section class="bg-white py-16 lg:py-24 relative z-10">
    <div class="max-w-5xl mx-auto px-6">
      <div class="text-center mb-14 anim-fly-up-sm">
        <p
          class="text-sm font-bold text-[#4a7425] uppercase tracking-wide mb-2"
        >
          Proses Mudah
        </p>
        <h2 class="text-3xl lg:text-4xl font-extrabold text-gray-900">
          Cara Ia Berfungsi
        </h2>
      </div>

      <ul
        class="steps steps-vertical sm:steps-horizontal w-full anim-fly-up"
        style="--color-primary: #7ced67; --color-primary-content: #1a2f13;"
      >
        {#each [{ title: "Daftar Akaun", desc: "Buat akaun percuma dalam beberapa minit sahaja." }, { title: "Akses Modul", desc: "Tonton video, muat turun nota, dan ikut checklist ikut kadar sendiri." }, { title: "Tanya & Praktik", desc: "Ada persoalan? Tanya terus dengan Abang Rumah sambil anda praktikkan di tapak." }] as step (step)}
          <li class="step step-primary">
            <div class="text-left pl-2 pt-1 max-w-[220px]">
              <div class="font-bold text-gray-900">{step.title}</div>
              <div class="text-sm text-gray-500">{step.desc}</div>
            </div>
          </li>
        {/each}
      </ul>
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
        {#each features as feature, i (feature)}
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

  <!-- FAQ — real, honest answers only. Pricing question deliberately
         points to the signup flow rather than quoting a figure here,
         so this section never goes stale or overpromises.
         daisyUI join + collapse-arrow: radio inputs share a name so
         only one answer is open at a time. -->
  <section class="bg-gray-50 py-16 lg:py-24 relative z-10">
    <div class="max-w-3xl mx-auto px-6">
      <div class="text-center mb-12 anim-fly-up-sm">
        <p
          class="text-sm font-bold text-[#4a7425] uppercase tracking-wide mb-2"
        >
          Ada Persoalan?
        </p>
        <h2 class="text-3xl lg:text-4xl font-extrabold text-gray-900">
          Soalan Lazim
        </h2>
      </div>

      <div class="join join-vertical w-full anim-fly-up">
        {#each [{ q: "Siapa yang sesuai belajar di Akademi Abang Rumah?", a: "Sesiapa sahaja yang ingin bina atau renovate rumah sendiri, dan mahu faham proses pembinaan supaya tidak mudah ditipu oleh kontraktor tak bertauliah — tak kira ada pengalaman pembinaan atau tidak." }, { q: "Berapa kos untuk sertai?", a: "Maklumat harga terkini boleh dilihat semasa proses pendaftaran akaun." }, { q: "Adakah saya perlu pengalaman pembinaan sebelum ini?", a: "Tidak. Modul disusun untuk mudah difahami walaupun anda baru pertama kali mendalami bidang pembinaan rumah." }, { q: "Bagaimana jika saya ada soalan semasa belajar?", a: "Anda boleh terus bertanya dengan Abang Rumah melalui ciri 'Tanya Abang Rumah' dalam aplikasi." }, { q: "Bolehkah saya akses di telefon?", a: "Boleh. Akademi Abang Rumah direka untuk diakses dengan selesa di telefon mahupun komputer." }] as item, i (item)}
          <div
            class="collapse collapse-arrow join-item border border-base-300 bg-white"
          >
            <input type="radio" name="faq-accordion" checked={i === 0} />
            <div class="collapse-title font-bold text-gray-900">
              {item.q}
            </div>
            <div class="collapse-content text-sm text-gray-500 leading-relaxed">
              {item.a}
            </div>
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
        href={resolve("/login")}
        class="inline-block bg-[#7ced67] hover:bg-[#65d452] transition-all duration-300 text-[#1a2f13] text-lg lg:text-xl font-semibold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 text-center leading-tight"
      >
        Mula belajar sekarang!
      </a>
    </div>
  </section>

  <!-- Social links — skeleton strip. TikTok href is a placeholder;
         swap it for the real profile URL once that account is live,
         or remove the TikTok <a> entirely if it doesn't happen. -->
  <section class="bg-white py-10 relative z-10">
    <div
      class="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
    >
      <span class="text-sm font-semibold text-gray-500">Ikuti Kami</span>
      <div class="flex items-center gap-3">
        <a
          href="https://www.facebook.com/profile.php?id=61552360927881"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook Akademi Abang Rumah"
          class="btn btn-circle btn-ghost text-gray-700 hover:bg-[#7ced67] hover:text-[#1a2f13]"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.631.771-1.631 1.562v1.878h2.777l-.444 2.91h-2.333V22c4.78-.756 8.438-4.92 8.438-9.94Z"
            />
          </svg>
        </a>
        <!-- TODO: TikTok not yet confirmed live — remove this <a> if it
               doesn't launch, or replace href with the real handle URL -->
        <a
          href="https://www.tiktok.com/@abangrumah_"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok Akademi Abang Rumah"
          class="btn btn-circle btn-ghost text-gray-700 hover:bg-[#7ced67] hover:text-[#1a2f13]"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M16.6 5.82c-.94-.86-1.5-2.06-1.6-3.37h-3.02v13.5c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1-2.72-2.72 2.72 2.72 0 0 1 2.72-2.72c.28 0 .55.04.8.12v-3.07a5.8 5.8 0 0 0-.8-.06A5.75 5.75 0 0 0 3.5 15.95 5.75 5.75 0 0 0 9.26 21.7a5.75 5.75 0 0 0 5.75-5.75V9.01a8.7 8.7 0 0 0 5.06 1.62V7.61c-1.24 0-2.42-.4-3.47-1.79Z"
            />
          </svg>
        </a>
      </div>
    </div>
  </section>
</div>

<style>
  /* Rigid phone frame — override daisyUI's default squircle/soft corners */
  :global(.mockup-phone) {
    border-radius: 2rem;
    padding-block: 16px; /* extends top & bottom bezel */
    padding-inline: 6px; /* keep side bezel as-is */
    corner-shape: normal; /* kill the superellipse squircle */
  }
  :global(.mockup-phone-display) {
    border-radius: 1.25rem;
    corner-shape: normal;
  }
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
