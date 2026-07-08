<!--src/routes/payment/return-->
<script>
	import { invalidateAll, goto } from '$app/navigation';
	import { onMount } from 'svelte';

	/** @type {{ data: { order: any } }} */
	let { data } = $props();

	// The webhook can land a second or two after the redirect, so if we're
	// still "pending" when the page loads, poll briefly for the real status.
	onMount(() => {
		if (data.order?.status !== 'pending') return;
		let attempts = 0;
		const interval = setInterval(async () => {
			attempts += 1;
			await invalidateAll();
			if (data.order?.status !== 'pending' || attempts >= 6) {
				clearInterval(interval);
			}
		}, 2000);
		return () => clearInterval(interval);
	});

	// Auto-redirect countdown for the two "final" states only — paid and
	// failed. "Not found" and "pending" never redirect on their own, since
	// there's nowhere useful to send someone yet.
	let redirectSeconds = $state(5);

	$effect(() => {
		const status = data.order?.status;
		const destination = status === 'paid' ? '/classroom' : status === 'failed' ? '/pay_landing' : null;

		if (!destination) return;

		redirectSeconds = 5;
		const timer = setInterval(() => {
			redirectSeconds -= 1;
			if (redirectSeconds <= 0) {
				clearInterval(timer);
				goto(destination);
			}
		}, 1000);

		// Cleanup if status changes again before the countdown finishes, or
		// the component unmounts.
		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>Status pembayaran</title>
</svelte:head>

<main class="bg-gray-50 flex items-center justify-center p-6 py-24">
	<div class="bg-white rounded-xl shadow-lg max-w-md w-full p-10 relative overflow-hidden">
		<div
			class="absolute top-0 left-0 right-0 h-1 opacity-10"
			style="background-image: repeating-linear-gradient(90deg, #4a7425 0 10px, transparent 10px 20px);"
		></div>

		{#if !data.order}
			<p class="text-xs font-mono uppercase tracking-widest text-[#4a7425] mb-3">Tiada rekod</p>
			<h1 class="text-2xl font-extrabold text-gray-900 mb-4">Kami tidak jumpa pesanan itu</h1>
			<p class="text-sm text-gray-600 leading-relaxed">
				Jika akaun anda telah didebit, simpan resit ToyyibPay anda dan hubungi kami supaya kami
				boleh padankan pembayaran tersebut.
			</p>
		{:else if data.order.status === 'paid'}
			<p class="text-xs font-mono uppercase tracking-widest text-[#4a7425] mb-3">Bil selesai</p>
			<h1 class="text-2xl font-extrabold text-gray-900 mb-4">Pembayaran diterima</h1>
			<p class="text-sm text-gray-600 leading-relaxed mb-6">
				Terima kasih, {data.order.customer_name}. Pembayaran anda sebanyak RM {data.order.amount.toFixed(
					2
				)} untuk {data.order.product_name} telah disahkan. Resit telah dihantar ke {data.order
					.customer_email}.
			</p>
			<p class="text-xs text-gray-400">
				Mengalihkan ke menu utama dalam {redirectSeconds}s… <a href="/" class="text-[#4a7425] font-semibold hover:underline">pergi sekarang</a>
			</p>
		{:else if data.order.status === 'failed'}
			<p class="text-xs font-mono uppercase tracking-widest text-red-600 mb-3">Tidak berjaya</p>
			<h1 class="text-2xl font-extrabold text-gray-900 mb-4">Pembayaran tidak berjaya</h1>
			<p class="text-sm text-gray-600 leading-relaxed mb-6">Tiada apa-apa telah didebit. Anda boleh cuba lagi.</p>
			<p class="text-xs text-gray-400">
				Kembali ke checkout dalam {redirectSeconds}s… <a href="/pay_landing" class="text-[#4a7425] font-semibold hover:underline">pergi sekarang</a>
			</p>
		{:else}
			<p class="text-xs font-mono uppercase tracking-widest text-[#4a7425] mb-3">Menunggu bank</p>
			<h1 class="text-2xl font-extrabold text-gray-900 mb-4">Mengesahkan pembayaran anda&hellip;</h1>
			<p class="text-sm text-gray-600 leading-relaxed">
				Ini biasanya mengambil masa beberapa saat sahaja. Halaman ini akan dikemas kini secara automatik.
			</p>
		{/if}
	</div>
</main>