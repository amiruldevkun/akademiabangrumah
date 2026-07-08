<script>
	/** @type {{ data: { userEmail: string | null, suggestedName: string } }} */
	let { data } = $props();

	let name = $state(data.suggestedName ?? '');
	let phone = $state('');
	let submitting = $state(false);
	let errorMsg = $state('');

	const PRODUCT = {
		name: 'Akademi Abang Rumah',
		tagline: 'test test',
		amountRM: 1,
		features: [
			'Whatever the customer actually gets, line one',
			'A second concrete thing they get',
			'A third — keep these specific, not generic'
		]
	};

	async function submit(e) {
		e.preventDefault();
		errorMsg = '';
		submitting = true;
		try {
			const res = await fetch('/api/create-bill', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, phone })
			});
			if (!res.ok) throw new Error('Could not start checkout');
			const { paymentUrl } = await res.json();
			window.location.href = paymentUrl;
		} catch (err) {
			console.error(err);
			errorMsg = 'Something went wrong starting checkout. Please try again.';
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{PRODUCT.name}</title>
</svelte:head>

<main class="min-h-screen bg-gray-50">
	<section class="max-w-5xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-2 md:items-start">
		<!-- Pitch -->
		<div>
			<p class="text-xs font-bold uppercase tracking-wide text-[#4a7425] mb-3">
				Bayaran sekali sahaja · Tiada akaun diperlukan
			</p>
			<h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
				{PRODUCT.name}
			</h1>
			<p class="text-lg text-gray-600 mb-8 max-w-md">
				{PRODUCT.tagline}
			</p>

			<ul class="space-y-3">
				{#each PRODUCT.features as feature}
					<li class="flex items-start gap-3 text-gray-700">
						<span
							class="mt-1 shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-[#4a7425] flex items-center justify-center text-xs font-bold"
						>
							✓
						</span>
						<span>{feature}</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Checkout card -->
		<div class="md:sticky md:top-8">
			<form
				onsubmit={submit}
				class="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-1"
			>
				<div class="flex items-baseline justify-between mb-2">
					<span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
						Bil kepada
					</span>
					<span class="text-xs font-mono text-gray-400">
						No. {new Date().getFullYear()}-CHK
					</span>
				</div>

				{#if data.userEmail}
					<div class="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2 mb-5">
						<span class="w-2 h-2 rounded-full bg-[#4a7425] shrink-0"></span>
						<span class="text-sm font-medium text-gray-700 truncate">{data.userEmail}</span>
					</div>
				{:else}
					<div class="bg-red-50 rounded-lg px-3 py-2 mb-5">
						<span class="text-sm text-red-600">
							Tidak dapat mengesahkan e-mel — sila log masuk semula.
						</span>
					</div>
				{/if}

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
					class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 mb-5
					       focus:outline-none focus:ring-2 focus:ring-[#4a7425] focus:border-[#4a7425]"
				/>

				<div class="border-t border-dashed border-gray-300 my-3 -mx-8"></div>

				<div class="flex items-baseline justify-between mb-5">
					<span class="text-sm text-gray-500">Jumlah perlu dibayar</span>
					<span class="text-xl font-mono font-semibold text-gray-900">
						RM {PRODUCT.amountRM.toFixed(2)}
					</span>
				</div>

				{#if errorMsg}
					<p class="text-sm text-red-600 mb-3" role="alert">{errorMsg}</p>
				{/if}

				<button
					type="submit"
					disabled={submitting}
					class="bg-[#4a7425] text-white font-semibold text-base px-6 py-3.5 rounded-xl shadow-lg
					       hover:bg-[#3d5f1f] transition-all transform hover:-translate-y-1 active:translate-y-0
					       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full"
				>
					{submitting ? 'Memulakan pembayaran…' : 'Bayar dengan ToyyibPay'}
				</button>

				<p class="text-xs text-gray-400 text-center mt-3.5 leading-relaxed">
					Pembayaran selamat dikendalikan oleh ToyyibPay. Anda akan diarahkan untuk
					melengkapkan pembayaran melalui FPX atau kad.
				</p>
			</form>
		</div>
	</section>
</main>