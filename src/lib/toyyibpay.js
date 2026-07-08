// src/lib/server/toyyibpay.js
//
// SERVER ONLY — this file uses your ToyyibPay secret key, which must never
// reach the browser. Only import it from +server.js files.
//
// Docs: https://toyyibpay.com/apireference/
// Sandbox base: https://dev.toyyibpay.com
// Production base: https://toyyibpay.com

import {
	TOYYIBPAY_SECRET_KEY,
	TOYYIBPAY_CATEGORY_CODE,
	TOYYIBPAY_BASE_URL 
} from '$env/static/private';

/**
 * Creates a ToyyibPay bill and returns { billCode, paymentUrl }.
 *
 * @param {Object} params
 * @param {string} params.billName - max 30 chars, alphanumeric/space/underscore only
 * @param {string} params.billDescription - max 100 chars
 * @param {number} params.amountRM - amount in Ringgit, e.g. 49.90
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {string} params.customerPhone
 * @param {string} params.externalReferenceNo - your own order id (unique)
 * @param {string} params.returnUrl - where the customer lands after paying
 * @param {string} params.callbackUrl - server-to-server webhook URL
 */
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
		billPriceSetting: '1', // 1 = fixed amount (set by you, not the customer)
		billPayorInfo: '1', // 1 = require the customer to fill in name/email/phone
		billAmount: String(Math.round(amountRM * 100)), // ToyyibPay wants cents
		billReturnUrl: returnUrl,
		billCallbackUrl: callbackUrl,
		billExternalReferenceNo: externalReferenceNo,
		billTo: customerName,
		billEmail: customerEmail,
		billPhone: customerPhone,
		billPaymentChannel: '2', // 0 = FPX only, 1 = card only, 2 = both
		billSplitPayment: '0',
		billChargeToCustomer: '1' // customer bears the ToyyibPay transaction fee
	});

	const res = await fetch(`${TOYYIBPAY_BASE_URL}/index.php/api/createBill`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});

	if (!res.ok) {
		throw new Error(`ToyyibPay createBill HTTP error: ${res.status}`);
	}

	const data = await res.json();

	// ToyyibPay returns [{ BillCode: "abcd1234" }] on success, or
	// [{ msg: "...", status: "error" }] on failure.
	const billCode = data?.[0]?.BillCode;
	if (!billCode) {
		throw new Error(`ToyyibPay did not return a BillCode: ${JSON.stringify(data)}`);
	}

	return {
		billCode,
		paymentUrl: `${TOYYIBPAY_BASE_URL}/${billCode}`
	};
}

/**
 * Server-to-server verification of a bill's real payment status.
 * Use this inside your callback handler instead of trusting the callback's
 * POST body directly, since anyone could POST to that URL.
 *
 * Returns the most recent transaction for the bill, or null if none exist.
 */
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

	const data = await res.json();
	if (!Array.isArray(data) || data.length === 0) return null;

	// Most recent transaction first, in case of retries.
	return data[data.length - 1];
}

export async function callback() {
    
}