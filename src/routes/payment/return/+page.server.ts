// src/routes/payment/return/+page.server.ts
//
// This is the customer-facing return URL (billReturnUrl). ToyyibPay
// redirects the browser here with query params (status_id, order_id, etc.)
// but those come from the customer's browser, so they're a hint, not proof.
//
// Rather than only passively reading whatever's in Supabase (and waiting
// for the webhook to eventually update it), this actively asks ToyyibPay
// directly whenever the order is still "pending" — self-healing exactly
// the gap that caused real customers to get stuck when webhook delivery
// didn't fire. The page's existing client-side polling (every 2s, up to
// 6 times) means this effectively retries the live check automatically
// for ~12 seconds without any extra work.

import { reconcileOrder } from "$lib/reconcileOrder";

export async function load({ url, cookies, platform }) {
  const orderId = url.searchParams.get("order_id");

  if (!orderId) {
    return { order: null };
  }

  const { order, error } = await reconcileOrder({ orderId }, platform);

  if (error && !order) {
    console.error("Could not load/reconcile order:", error, { orderId });
    return { order: null };
  }

  if (order?.status === "paid") {
    // Drives the one-time "Tahniah! DAFTAR" welcome banner on the homepage.
    // Deliberately short-lived: the homepage reads it once and deletes it
    // immediately (see src/routes/+page.server.ts), so this maxAge only
    // matters as a safety net in case the user closes the tab here and
    // never actually makes it to the homepage.
    cookies.set("just_paid", "true", {
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
  }

  return { order };
}

// UNCOMMENT THIS AFTER TESTING
