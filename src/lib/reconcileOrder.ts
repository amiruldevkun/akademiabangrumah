// src/lib/reconcileOrder.js
//
// SERVER ONLY. Shared by the admin reconcile tool AND the payment/return
// page's polling — one place that knows how to ask ToyyibPay for an
// order's real status and apply it, instead of only ever waiting
// passively for the webhook to arrive.

import { supabaseAdmin } from "$lib/supabaseAdmin";
import { getBillTransactions } from "$lib/toyyibpay";

/**
 * @param {string} orderId
 * @returns {Promise<{ order: any, checkedToyyibPay: boolean, error?: string }>}
 */

export type toyyibpayID = {
  orderId?: string | null;
};

export async function reconcileOrder({ orderId }: toyyibpayID) {
  const { data: order, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select(
      "id, status, toyyibpay_bill_code, user_id, amount, currency, product_name, customer_name, customer_email",
    )
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return { order: null, checkedToyyibPay: false, error: "Order not found" };
  }

  // Already in a terminal state — nothing to reconcile, and no reason to
  // burn a ToyyibPay API call checking something that's already settled.
  if (order.status === "paid" || order.status === "failed") {
    return { order, checkedToyyibPay: false };
  }

  if (!order.toyyibpay_bill_code) {
    // Bill was never even created successfully — nothing to check yet.
    return { order, checkedToyyibPay: false };
  }

  let tx;
  try {
    tx = await getBillTransactions(order.toyyibpay_bill_code);
  } catch (err) {
    // 1. Safely figure out the error message
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[reconcileOrder] getBillTransactions failed:", err, {
      orderId,
    });
    return { order, checkedToyyibPay: true, error: errorMessage };
  }

  if (!tx) {
    // ToyyibPay has no transaction on file yet — genuinely still pending,
    // not stuck. Nothing to update.
    return { order, checkedToyyibPay: true };
  }

  const newStatus =
    tx.billpaymentStatus === "1"
      ? "paid"
      : tx.billpaymentStatus === "3"
        ? "failed"
        : "pending";

  if (newStatus === order.status) {
    // No change — still pending per ToyyibPay too.
    return { order, checkedToyyibPay: true };
  }

  const { data: updatedOrder, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: newStatus,
      toyyibpay_ref_no: tx.billpaymentInvoiceNo ?? null,
      paid_at: newStatus === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", orderId)
    .select(
      "id, status, toyyibpay_bill_code, user_id, amount, currency, product_name, customer_name, customer_email",
    )
    .single();

  if (updateError) {
    console.error("[reconcileOrder] order update failed:", updateError, {
      orderId,
    });
    return { order, checkedToyyibPay: true, error: "Failed to update order" };
  }

  console.log("[reconcileOrder] self-healed order via live ToyyibPay check", {
    orderId,
    previousStatus: order.status,
    newStatus,
  });

  if (newStatus === "paid" && updatedOrder.user_id) {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ has_paid: true, paid_at: new Date().toISOString() })
      .eq("id", updatedOrder.user_id);

    if (profileError) {
      console.error("[reconcileOrder] profile update failed:", profileError, {
        orderId,
      });
    }
  }

  return { order: updatedOrder, checkedToyyibPay: true };
}
