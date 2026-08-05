<script lang="ts">
  import { onMount } from "svelte";
  // Function to go back to the previous page
  function goBack() {
    window.history.back();

    onMount(() => {
      // Scroll to the top of the page when the component is mounted
      window.scrollTo(0, 0);
      document.addEventListener("click", goBack);

      return () => {
        document.removeEventListener("click", goBack);
      };
    });
  }
</script>

<div class="flex flex-1 relative">
  <a
    href="#"
    onclick={goBack}
    id="back"
    class="absolute top-4 left-4 z-70 bg-[#4a7425] text-white font-semibold text-sm px-4 py-2 mt-2 rounded-lg shadow-lg hover:bg-[#4a7425] active:bg-[#6bb52a] transition-all transform hover:-translate-y-1 active:translate-y-0 border-solid"
  >
    &larrhk; Kembali
  </a>
  <main class="flex-1 flex flex-col items-center p-6 max-w-2xl mx-auto">
    <img
      src="assets/images/en ayub self portrait.webp"
      alt="About Image"
      class="w-full max-w-md mb-6 rounded-lg shadow-lg"
    />
    <h1
      class="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
    >
      Tentang Saya
    </h1>
    <p class="text-lg text-gray-600 mb-8 leading-relaxed">
      Selamat Datang ke Akademi Abang Rumah! Saya En Ayub, pengasas dan pengajar
      di platform ini. Dengan pengalaman bertahun-tahun sebagai profesional di
      bidang ini, saya berkomitmen untuk menyediakan kandungan pembelajaran yang
      berkualiti tinggi dan relevan untuk membantu anda mencapai potensi penuh
      anda. Terima kasih kerana menyertai kami dalam perjalanan pembelajaran
      ini!
    </p>
  </main>
</div>
