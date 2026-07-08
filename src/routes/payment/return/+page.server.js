// src/routes/payment/return/+page.server.js
//
// This is the customer-facing return URL (billReturnUrl). ToyyibPay
// redirects the browser here with query params (status_id, order_id, etc.)
// but those come from the customer's browser, so they're a hint, not proof.
// We look up the real status in Supabase, which is only ever written by our
// own server (create-bill) and the verified webhook (callback).

import { supabaseAdmin } from '$lib/supabaseAdmin';

export async function load({ url }) {
	const orderId = url.searchParams.get('order_id');

	if (!orderId) {
		return { order: null };
	}

	const { data: order, error } = await supabaseAdmin
		.from('orders')
		.select('id, product_name, amount, currency, status, customer_name, customer_email')
		.eq('id', orderId)
		.single();

	if (error) {
		console.error('Could not load order:', error);
		return { order: null };
	}

	return { order };
}