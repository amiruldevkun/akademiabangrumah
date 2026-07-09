// src/lib/toyyibpay.js
//
// SERVER ONLY — uses your ToyyibPay secret key, which must never reach
// the browser. Only import from +server.js files.
//

import {
	TOYYIBPAY_SECRET_KEY,
	TOYYIBPAY_CATEGORY_CODE,
	TOYYIBPAY_BASE_URL
} from '$env/static/private';

// ToyyibPay doesn't always return JSON — sometimes it's a plain-text
// error string like "[CATEGORY-NOT-FOUND]". Parse defensively so a
// non-JSON response surfaces its actual message instead of a confusing
// "Unexpected token" JSON.parse crash.
async function parseToyyibPayResponse(res) {
	const raw = await res.text();
	try {
		return JSON.parse(raw);
	} catch {
		throw new Error(`ToyyibPay returned a non-JSON response: ${raw.trim()}`);
	}
}

export async function createBill({
	billName,
	billDescription,
	amountRM,
	customerName,
	customerEmail,
	customerPhone,
	externalReferenceNo,
	returnUrl,
	callbackUrl
}) {
	const body = new URLSearchParams({
		userSecretKey: TOYYIBPAY_SECRET_KEY,
		categoryCode: TOYYIBPAY_CATEGORY_CODE,
		billName: billName.slice(0, 30),
		billDescription: billDescription.slice(0, 100),
		billPriceSetting: '1',
		billPayorInfo: '1',
		billAmount: String(Math.round(amountRM * 100)),
		billReturnUrl: returnUrl,
		billCallbackUrl: callbackUrl,
		billExternalReferenceNo: externalReferenceNo,
		billTo: customerName,
		billEmail: customerEmail,
		billPhone: customerPhone,
		billPaymentChannel: '2',
		billSplitPayment: '0',
		billChargeToCustomer: '1'
	});

	const res = await fetch(`${TOYYIBPAY_BASE_URL}/index.php/api/createBill`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});

	if (!res.ok) {
		throw new Error(`ToyyibPay createBill HTTP error: ${res.status}`);
	}

	const data = await parseToyyibPayResponse(res);

	const billCode = data?.[0]?.BillCode;
	if (!billCode) {
		throw new Error(`ToyyibPay did not return a BillCode: ${JSON.stringify(data)}`);
	}

	return {
		billCode,
		paymentUrl: `${TOYYIBPAY_BASE_URL}/${billCode}`
	};
}

export async function getBillTransactions(billCode) {
	const body = new URLSearchParams({ billCode });

	const res = await fetch(`${TOYYIBPAY_BASE_URL}/index.php/api/getBillTransactions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});

	if (!res.ok) {
		throw new Error(`ToyyibPay getBillTransactions HTTP error: ${res.status}`);
	}

	const data = await parseToyyibPayResponse(res);
	if (!Array.isArray(data) || data.length === 0) return null;

	return data[data.length - 1];
}