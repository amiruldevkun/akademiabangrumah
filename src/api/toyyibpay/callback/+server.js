// src/routes/payment/callback/+server.js
//
// This is the server-to-server webhook — set this exact URL
// (https://yourdomain.com/payment/callback) as billCallbackUrl.
// Cannot be received on localhost per ToyyibPay's docs — test this via a
// tunnel (ngrok) or on a real deploy.
//
// ToyyibPay POSTs form data here: refno, status, reason, billcode,
// order_id, amount, transaction_time, hash.
//
// Per the official docs, the request MUST be validated using the "hash"
// field before you trust anything else in the payload — this is what
// proves the POST actually came from ToyyibPay and not a random client
// hitting this URL with a fake "status=1":
//
//   expected_hash = MD5( userSecretKey + status + order_id + refno + "ok" )

import { createHash } from 'crypto';
import { text } from '@sveltejs/kit';
import { TOYYIBPAY_SECRET_KEY } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

function md5(str) {
	return createHash('md5').update(str).digest('hex');
}

export async function POST({ request }) {
	const form = await request.formData();

	const refno = form.get('refno') ?? '';
	const status = form.get('status') ?? ''; // "1" success, "2" pending, "3" fail
	const reason = form.get('reason');
	const billcode = form.get('billcode');
	const orderId = form.get('order_id'); // our externalReferenceNo / orders.id
	const amount = form.get('amount');
	const receivedHash = form.get('hash');

	if (!orderId || !receivedHash) {
		// Return 200 anyway so ToyyibPay doesn't endlessly retry a malformed hit.
		return text('missing order_id or hash', { status: 200 });
	}

	const expectedHash = md5(`${TOYYIBPAY_SECRET_KEY}${status}${orderId}${refno}ok`);

	if (receivedHash !== expectedHash) {
		console.error('ToyyibPay callback hash mismatch — possible spoofed request', {
			orderId,
			billcode
		});
		// 200 so ToyyibPay stops retrying, but we do NOT touch the order.
		return text('invalid hash', { status: 200 });
	}

	// Hash checks out — safe to trust the rest of this payload.
	const orderStatus = status === '1' ? 'paid' : status === '3' ? 'failed' : 'pending';

	const { error: updateError } = await supabaseAdmin
		.from('orders')
		.update({
			status: orderStatus,
			toyyibpay_bill_code: billcode,
			toyyibpay_ref_no: refno,
			paid_at: orderStatus === 'paid' ? new Date().toISOString() : null
		})
		.eq('id', orderId);

	if (updateError) {
		console.error('Supabase update error in callback:', updateError, { orderId, reason, amount });
		return text('db error, logged', { status: 200 });
	}

	return text('OK', { status: 200 });
}