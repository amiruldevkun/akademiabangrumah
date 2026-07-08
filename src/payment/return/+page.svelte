<script>
	import { invalidateAll } from '$app/navigation';
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
</script>

<svelte:head>
	<title>Payment status</title>
</svelte:head>

<main class="wrap">
	<div class="stub">
		{#if !data.order}
			<p class="eyebrow">No record found</p>
			<h1>We couldn't find that order</h1>
			<p class="body">
				If you were charged, hang on to your ToyyibPay receipt and get in touch with us so we can
				match it up.
			</p>
		{:else if data.order.status === 'paid'}
			<p class="eyebrow">Bill settled</p>
			<h1>Payment received</h1>
			<p class="body">
				Thanks, {data.order.customer_name}. Your payment of RM {data.order.amount.toFixed(2)} for
				{data.order.product_name} is confirmed. A receipt has been sent to {data.order.customer_email}.
			</p>
		{:else if data.order.status === 'failed'}
			<p class="eyebrow">Not completed</p>
			<h1>Payment didn't go through</h1>
			<p class="body">Nothing was charged. You can try again whenever you're ready.</p>
			<a class="retry" href="/pay_landing">Back to checkout</a>
		{:else}
			<p class="eyebrow">Waiting on the bank</p>
			<h1>Confirming your payment&hellip;</h1>
			<p class="body">This usually takes a few seconds. This page will update on its own.</p>
		{/if}
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #10182b;
		font-family: 'Inter', system-ui, sans-serif;
	}

	.wrap {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.stub {
		background: #faf7f0;
		max-width: 460px;
		width: 100%;
		padding: 48px 40px;
		border-radius: 4px;
		position: relative;
		box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.5);
	}

	.stub::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: repeating-linear-gradient(90deg, #10182b 0 10px, transparent 10px 20px);
		opacity: 0.15;
	}

	.eyebrow {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 12px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #0f8b6c;
		margin: 0 0 12px;
	}

	h1 {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 30px;
		line-height: 1.2;
		margin: 0 0 16px;
		color: #10182b;
	}

	.body {
		font-size: 15px;
		line-height: 1.6;
		color: #4b5160;
		margin: 0;
	}

	.retry {
		display: inline-block;
		margin-top: 24px;
		color: #0f8b6c;
		font-weight: 600;
		text-decoration: none;
		border-bottom: 1px solid #0f8b6c;
	}
</style>