<script lang='ts'>
	/** @type {{ data: { user: any, continueLesson: any | null } }} */
	let { data } = $props();
	let index = $state(0);


	import quotes from '$lib/quotes.json';


	$effect(() => {
		const timer = setInterval(() => {
			index = (index + 1) % quotes.length;
		}, 10000)

		return() => clearInterval(timer);
	});
	let current = $derived(quotes[index]);
	let warningState = $state(true);

	const menuTiles = [
		{ label: 'Modul Video', sub: 'Belajar ikut modul', href: '/classroom', icon: 'play', disabled: false },
		{ label: 'Nota & PDF', sub: 'Muat turun nota', href: '/akan-datang', icon: 'doc' , disabled: true},
		{ label: 'Checklist Tapak', sub: 'Senarai semak kerja', href: '/akan-datang', icon: 'clipboard', disabled: true },
		{ label: 'Kalkulator', sub: 'Kira anggaran kos', href: '/akan-datang', icon: 'calculator' , disabled: true},
		{ label: 'SOP Kerja', sub: 'Panduan kerja tapak', href: '/akan-datang', icon: 'hardhat' , disabled: true},
		{ label: 'Tanya Abang Rumah', sub: 'Soalan & jawapan', href: '/akan-datang', icon: 'chat' , disabled: true},
		{ label: 'Group VVIP', sub: 'WhatsApp eksklusif', href: '/akan-datang', icon: 'users' , disabled: true},
		{ label: 'Bonus & Template', sub: 'Template & bonus', href: '/akan-datang', icon: 'gift' ,disabled: true}
	];

	const announcements = [
		{ text: 'Modul baru telah ditambah:', bold: 'Kerja Atap & Bumbung' },
		{ text: 'Live bersama Abang Rumah hari', bold: 'Jumaat (8.30 malam)' },
		{ text: 'Bonus PDF:', bold: 'Senarai harga bahan bina terkini' }
	];

	export function closeWarning() {
		warningState = false;
	}
</script>

<svelte:head>
	<title>Menu Utama - Akademi Abang Rumah</title>
	<meta name="description" content="Menu Utama untuk platform Akademi Abang Rumah">
</svelte:head>

<main class="bg-gray-50 pb-24">
	{#if warningState === true}
		<div class="bg-[#9bd964] text-center justify-center flex text-red-600 px-3 py-3">
			<h1 class="ml-auto"> Ada beberapa video tidak dapat ditrack. Harap maaf atas kesulitan ini. Kami akan baikinya dalam masa terdekat ini</h1>
			<button onclick={closeWarning} class="ml-auto">
			x
			</button>
		</div>
	{/if}
	<div class="max-w-5xl mx-auto px-4 py-6 space-y-6">
		{#if data.showElement}
			<!-- Welcome / registration banner -->
			<div class="bg-linear-to-r from-[#1a1a1a] to-[#3a3a3a] rounded-xl overflow-hidden shadow-lg relative">
				<div class="p-6 sm:p-8">
					<p class="text-red-500 font-extrabold text-2xl sm:text-3xl italic">Tahniah!</p>
					<p class="text-red-600 font-extrabold text-3xl sm:text-4xl -mt-1">DAFTAR</p>
					<p class="text-white/90 text-sm mt-2 max-w-xs">
						Selamat datang ke <span class="text-[#7fbf5f] font-bold">AKADEMI ABANG RUMAH</span>
					</p>
				</div>
			</div>
		{/if}

		<!-- Sambung Belajar -->
		{#await data.continueLesson}
			<!-- Skeleton mirrors the resolved card's layout so there's no
			     layout shift when the real data streams in. -->
			<div class="bg-emerald-50 rounded-xl p-4 sm:p-5 animate-pulse">
				<div class="flex items-center justify-between mb-3">
					<div class="h-4 w-32 bg-emerald-200/60 rounded"></div>
					<div class="h-4 w-16 bg-emerald-200/60 rounded"></div>
				</div>
				<div class="flex flex-col sm:flex-row items-center gap-4">
					<div class="w-full sm:w-40 h-24 rounded-lg bg-emerald-200/60 shrink-0"></div>
					<div class="flex-1 w-full space-y-3">
						<div class="h-3 w-16 bg-emerald-200/60 rounded"></div>
						<div class="h-4 w-3/4 bg-emerald-200/60 rounded"></div>
						<div class="h-2 w-full bg-emerald-200/60 rounded-full"></div>
					</div>
					<div class="h-12 w-full sm:w-32 bg-emerald-200/60 rounded-lg shrink-0"></div>
				</div>
			</div>
		{:then continueLesson}
			{#if continueLesson}
				<a
					href="/classroom?item={continueLesson.id}"
					class="block bg-emerald-50 rounded-xl p-4 sm:p-5 hover:shadow-md transition"
				>
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center gap-2 text-[#4a7425] font-bold text-sm">
							<span class="text-lg">▶</span> SAMBUNG BELAJAR
						</div>
						<span class="text-sm text-gray-500">Lihat Semua ›</span>
					</div>
					<div class="flex flex-col sm:flex-row items-center gap-4">
						<div class="relative w-full sm:w-40 shrink-0">
							{#if continueLesson.thumbnail}
								<img
									src={continueLesson.thumbnail}
									alt={continueLesson.title}
									class="w-full h-24 object-cover rounded-lg"
								/>
							{:else}
								<!-- No thumbnail source for Google Drive lessons — generic
								     placeholder instead of a broken/missing image. -->
								<div class="w-full h-24 rounded-lg bg-[#4a7425]/10 flex items-center justify-center text-3xl">
									🎬
								</div>
							{/if}
							{#if continueLesson.durationLabel}
								<span class="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
									{continueLesson.durationLabel}
								</span>
							{/if}
							<span class="absolute inset-0 flex items-center justify-center">
								<span class="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-[#4a7425]">▶</span>
							</span>
						</div>
						<div class="flex-1 w-full">
							<p class="text-xs font-semibold text-[#4a7425] mb-0.5">Modul {continueLesson.moduleNumber}</p>
							<p class="font-bold text-gray-900 mb-2">{continueLesson.title}</p>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div
									class="bg-[#4a7425] h-2 rounded-full"
									style="width: {continueLesson.progressPercent}%"
								></div>
							</div>
							<p class="text-xs text-gray-500 mt-1">{continueLesson.progressPercent}%</p>
						</div>
						<button
							class="bg-[#4a7425] text-white font-semibold px-5 py-3 rounded-lg shrink-0 hover:bg-[#3d5f1f] transition w-full sm:w-auto"
						>
							Sambung Belajar ▶
						</button>
					</div>
				</a>
			{:else}
				<!-- No progress yet (new user, or nothing accessible) — a starting
				     prompt instead of fabricated placeholder progress. -->
				<a
					href="/classroom"
					class="block bg-emerald-50 rounded-xl p-5 hover:shadow-md transition text-center"
				>
					<p class="font-bold text-[#4a7425] mb-1">▶ Mula Belajar Sekarang</p>
					<p class="text-sm text-gray-600">Belum ada video ditonton lagi — jom mula modul pertama anda.</p>
				</a>
			{/if}
		{:catch}
			<!-- Rare: only fires if loadContinueLesson() throws server-side —
			     same fallback as the "nothing accessible" empty state. -->
			<a
				href="/classroom"
				class="block bg-emerald-50 rounded-xl p-5 hover:shadow-md transition text-center"
			>
				<p class="font-bold text-[#4a7425] mb-1">▶ Mula Belajar Sekarang</p>
				<p class="text-sm text-gray-600">Belum ada video ditonton lagi — jom mula modul pertama anda.</p>
			</a>
		{/await}

		<!-- Menu grid -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
			{#each menuTiles as tile}
				<svelte:element
					this={tile.disabled ? 'div' : 'a'}
					href={tile.disabled ? undefined : tile.href}
					class="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center gap-2 transition relative
						{tile.disabled
							? 'opacity-50 pointer-events-none select-none'
							: 'hover:shadow-md hover:-translate-y-0.5'}"
				>
					{#if tile.disabled}
						<span class="absolute top-1.5 right-1.5 text-[9px] font-semibold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
							Akan Datang
						</span>
					{/if}
					<span class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-[#4a7425] text-xl">
						{#if tile.icon === 'play'}▶{:else if tile.icon === 'doc'}📄{:else if tile.icon === 'clipboard'}📋{:else if tile.icon === 'calculator'}🧮{:else if tile.icon === 'hardhat'}👷{:else if tile.icon === 'chat'}💬{:else if tile.icon === 'users'}👥{:else if tile.icon === 'gift'}🎁{/if}
					</span>
					<span class="font-semibold text-sm {tile.disabled ? 'text-gray-500' : 'text-gray-900'}">{tile.label}</span>
					<span class="text-xs text-gray-500">{tile.sub}</span>
				</svelte:element>
			{/each}
		</div>

		<!-- Progress + Latest videos — both disabled for now. Neither has a
		     real data source yet: the donut needs a defined "total modules"
		     count to be meaningful, and "latest videos" needs publish dates,
		     which sidebar-data.json doesn't carry. Showing them grayed out
		     with "Akan Datang" beats showing fabricated numbers. -->
		<div class="grid sm:grid-cols-2 gap-4">
			<!-- Progress donut (disabled) -->
			<div class="bg-white rounded-xl shadow p-5 opacity-50 pointer-events-none select-none relative sm:col-span-2">
				<span class="absolute top-3 right-3 text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
					Akan Datang
				</span>
				<p class="font-bold text-gray-900 mb-4 flex items-center gap-2">📊 KEMAJUAN BELAJAR SAYA</p>
				<div class="flex items-center gap-5">
					<div class="w-24 h-24 rounded-full shrink-0 flex items-center justify-center bg-gray-100">
						<div class="w-18 h-18 rounded-full bg-white flex flex-col items-center justify-center">
							<span class="font-extrabold text-lg text-gray-400">--%</span>
							<span class="text-[10px] text-gray-400">Selesai</span>
						</div>
					</div>
					<div class="flex-1">
						<p class="font-bold text-gray-400">-- / -- Modul</p>
						<p class="text-xs text-gray-400 mb-2">Modul selesai</p>
						<div class="w-full bg-gray-200 rounded-full h-2 mb-2"></div>
						<p class="text-xs text-gray-400">Ciri ini akan datang tidak lama lagi.</p>
					</div>
				</div>
			</div>

			<!-- Latest videos (disabled) -->
			<!-- <div class="bg-white rounded-xl shadow p-5 opacity-50 pointer-events-none select-none relative">
				<span class="absolute top-3 right-3 text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
					Akan Datang
				</span>
				<p class="font-bold text-gray-900 mb-3 flex items-center gap-2">▶ VIDEO TERBARU</p>
				<p class="text-sm text-gray-400">Ciri ini akan datang tidak lama lagi.</p>
			</div> -->
		</div>

		<!-- Tip + Pengumuman -->
		<div class="grid sm:grid-cols-2 gap-4">
			<div class="bg-yellow-50 rounded-xl p-5 flex items-center gap-4">
				<div class="flex-1">
				{#key current.id}
					{console.log(current.id)}
					<p class="font-bold text-gray-900 mb-2 flex items-center gap-2">💡 TIP HARI INI</p>
					<p class="font-bold ">{ current.category }</p>
						<p class="text-sm text-gray-700 italic">
							{current.quote}
						</p>
					<p class="text-xs text-gray-500 mt-1">– Abang Rumah</p>
				{/key}
				</div>
				<img
					src="/assets/images/enayub cta poster.jpg"
					alt="Abang Rumah"
					class="w-16 h-16 rounded-full object-cover shrink-0"
				/>
			</div>

			<div class="bg-blue-50 rounded-xl p-5">
				<div class="flex items-center justify-between mb-3">
					<p class="font-bold text-gray-900 flex items-center gap-2">📢 PENGUMUMAN</p>
					<span class="text-sm text-gray-500">Lihat Semua ›</span>
				</div>
				<ul class="space-y-2">
					{#each announcements as item}
						<li class="text-sm text-gray-700 flex gap-2">
							<span class="text-[#4a7425]">•</span>
							<span>{item.text} <span class="font-semibold">{item.bold}</span></span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<!-- Bottom nav (mobile) -->
	<nav class="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 sm:hidden z-40">
		<a href="/" class="flex flex-col items-center text-[#4a7425] text-xs gap-0.5">
			<span class="text-lg">🏠</span> Home
		</a>
		<a href="/classroom" class="flex flex-col items-center text-gray-500 text-xs gap-0.5">
			<span class="text-lg">📖</span> Belajar
		</a>
		<a href="/akan-datang" class="flex flex-col items-center text-gray-500 text-xs gap-0.5">
			<span class="text-lg">⬇️</span> Downloads
		</a>
		<a href="/akan-datang" class="flex flex-col items-center text-gray-500 text-xs gap-0.5">
			<span class="text-lg">💬</span> Bantuan
		</a>
		<a href="/akan-datang" class="flex flex-col items-center text-gray-500 text-xs gap-0.5">
			<span class="text-lg">👤</span> Akaun
		</a>
	</nav>
</main>