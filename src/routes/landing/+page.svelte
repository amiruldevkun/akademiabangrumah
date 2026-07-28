<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>Akademi Abang Rumah</title>
  <meta name="description" content="Aplikasi untuk mengakses panduan dan tunjuk ajar Abang Rumah secara on demand!">
</svelte:head>

{#if mounted}
  <div class="min-h-screen bg-gray-50 font-sans overflow-x-hidden flex flex-col" in:fade={{ duration: 600 }}>
    

    <!-- Main Hero Section -->
    <main class="flex-1 relative flex items-center py-12 lg:py-0">
      
      <!-- Improved Light Green Background Block -->
      <!-- Added rounded-r-full for a softer, more modern aesthetic -->
      <div 
        class="absolute top-12 lg:top-1/4 left-0 w-full lg:w-[80%] h-100 bg-[#7ced67] shadow-sm rounded-r-[3rem] z-0"
        in:fly={{ x: -100, duration: 800, delay: 200 }}
      ></div>

      <!-- Content Container -->
      <div class="max-w-7xl mx-auto w-full px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 min-h-[calc(100vh-80px)]">
        
        <!-- Left Column: Typography & CTA -->
        <div class="w-full lg:w-3/5 flex flex-col justify-center pt-8 lg:pt-0">
          
          <div in:fly={{ y: 30, duration: 800, delay: 400 }} >
            <h1 class="text-5xl mb-6  md:text-6xl lg:text-[4rem] font-extrabold text-gray-900 uppercase tracking-tight leading-none">
              BINA RUMAH IDAMAN ANDA
            </h1>
            <p class="text-xl  md:text-2xl text-gray-800 font-medium max-w-xl leading-relaxed">
              Mahu belajar buat rumah sendiri? Mahu elakkan helah kontraktor tak bertauliah? Mari belajar buat rumah bersama Abang Rumah!
            </p>
          </div>

          <!-- Call to Action -->
          <!-- Moved out of the green block visually and tied color to the navbar for cohesion -->
          <div class="mt-8 lg:mt-10" in:fly={{ y: 30, duration: 800, delay: 600 }}>
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
          class="w-full lg:w-2/5 flex justify-center lg:justify-end" 
          in:fly={{ x: 50, duration: 800, delay: 800 }}
        >
          <!-- Sleek CSS Device Frame -->
          <div class="relative w-[320px] h-170 bg-white rounded-[3rem] border-10 border-[#1f2937] shadow-2xl overflow-hidden ring-4 ring-gray-100 shrink-0">
            
            <!-- 
              TODO: Replace 'app-screenshot.png' with the actual path to your screenshot 
              Make sure to place your screenshot in the 'static' folder of your SvelteKit project.
            -->
            <img 
              src="/assets/images/image.png" 
              alt="Akademi Abang Rumah App Screenshot" 
              class="w-full h-full object-cover"
              style="background-color: #f3f4f6;" 
            />
            
            <!-- Optional: Simulated iPhone Notch -->
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1f2937] rounded-b-2xl z-10"></div>
          </div>
        </div>

      </div>
    </main>
  </div>
{/if}