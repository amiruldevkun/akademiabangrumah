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

import { createHash } from "node:crypto";
import { text } from "@sveltejs/kit";

import { getSupabaseAdmin } from "$lib/supabaseAdmin";

function md5(str: string) {
  return createHash("md5").update(str).digest("hex");
}

export async function POST({ request, platform }) {
  const form = await request.formData();

  const refno = form.get("refno") ?? "";
  const status = form.get("status") ?? ""; // "1" success, "2" pending, "3" fail
  const reason = form.get("reason");
  const billcode = form.get("billcode");
  const orderId = form.get("order_id"); // our externalReferenceNo / orders.id
  const amount = form.get("amount");
  const receivedHash = form.get("hash");
  const tpKey = platform?.env?.TOYYIBPAY_SECRET_KEY;

  if (!tpKey) {
    throw new Error("toyyibpay key is undefined, debug please");
  }

  console.log("[toyyibpay callback] received", {
    orderId,
    billcode,
    status,
    refno,
    amount,
  });

  if (!orderId || !receivedHash) {
    console.warn("[toyyibpay callback] missing order_id or hash — ignoring", {
      orderId,
      billcode,
    });
    // Return 200 anyway so ToyyibPay doesn't endlessly retry a malformed hit.
    return text("missing order_id or hash", { status: 200 });
  }

  const expectedHash = md5(`${tpKey}${status}${orderId}${refno}ok`);

  if (receivedHash !== expectedHash) {
    console.error(
      "[toyyibpay callback] HASH MISMATCH — possible spoofed request or wrong secret key",
      {
        orderId,
        billcode,
      },
    );
    // 200 so ToyyibPay stops retrying, but we do NOT touch the order.
    return text("invalid hash", { status: 200 });
  }

  console.log("[toyyibpay callback] hash verified OK", { orderId, billcode });

  // Hash checks out — safe to trust the rest of this payload.
  const orderStatus =
    status === "1" ? "paid" : status === "3" ? "failed" : "pending";

  const supabaseAdmin = getSupabaseAdmin(platform);

  const { data: order, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: orderStatus,
      toyyibpay_bill_code: billcode,
      toyyibpay_ref_no: refno,
      paid_at: orderStatus === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", orderId)
    .select("user_id")
    .single();

  if (updateError) {
    console.error("[toyyibpay callback] SUPABASE UPDATE FAILED", updateError, {
      orderId,
      reason,
      amount,
    });
    return text("db error, logged", { status: 200 });
  }

  console.log("[toyyibpay callback] order updated", {
    orderId,
    orderStatus,
    userId: order?.user_id,
  });

  // This is the flag that actually grants access — checked on every
  // login, so it persists across devices/re-logins without needing to
  // look at `orders` again.
  if (orderStatus === "paid" && order?.user_id) {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ has_paid: true, paid_at: new Date().toISOString() })
      .eq("id", order.user_id);

    if (profileError) {
      console.error(
        "[toyyibpay callback] FAILED TO FLIP has_paid",
        profileError,
        { orderId, userId: order.user_id },
      );
    } else {
      console.log("[toyyibpay callback] has_paid set true", {
        userId: order.user_id,
      });
    }
  }

  return text("OK", { status: 200 });
}
