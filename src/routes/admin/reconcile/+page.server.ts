// src/routes/admin/reconcile/+page.server.js
//
// Manual stopgap for cases where ToyyibPay's webhook never fires (as
// happened with a real transaction — confirmed paid at the bank level,
// but no callback ever reached us). Lets an admin punch in an order ID,
// asks ToyyibPay directly what actually happened via getBillTransactions,
// and applies the same update logic the webhook would have.
//
// Gated by email allowlist since there's no admin-role system yet — set
// ADMIN_EMAILS in .env as a comma-separated list.

import { error, fail } from "@sveltejs/kit";

import { reconcileOrder } from "$lib/reconcileOrder";

type AdminLocals = {
  user?: {
    email?: string | null;
  } | null;
};

function assertIsAdmin(locals: AdminLocals, admin_emails: string) {
  const allowlist = (admin_emails ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  const email = locals.user?.email?.toLowerCase();
  if (!email || !allowlist.includes(email)) {
    throw error(403, "Not authorized");
  }
}

export async function load({ locals, platform }) {
  const admin_Emails = platform?.env?.ADMIN_EMAILS;

  if (!admin_Emails) {
    throw new Error("Admin emails is undefined. debug");
  }

  assertIsAdmin(locals, admin_Emails);
  return {};
}

export const actions = {
  reconcile: async ({ request, locals, platform }) => {
    const admin_Emails = platform?.env?.ADMIN_EMAILS;

    if (!admin_Emails) {
      throw new Error("Admin emails is undefined. debug");
    }
    assertIsAdmin(locals, admin_Emails);

    const form = await request.formData();
    const orderId = form.get("order_id")?.toString().trim();

    if (!orderId) {
      return fail(400, { message: "Order ID is required" });
    }

    const {
      order,
      checkedToyyibPay,
      error: reconcileError,
    } = await reconcileOrder({ orderId }, platform);

    if (!order) {
      return fail(404, { message: `No order found with ID ${orderId}` });
    }

    if (reconcileError) {
      return fail(502, {
        message: `ToyyibPay lookup failed: ${reconcileError}`,
      });
    }

    if (!checkedToyyibPay && !order.toyyibpay_bill_code) {
      return fail(400, {
        message:
          "This order has no ToyyibPay bill code on file — cannot look up.",
      });
    }

    return {
      success: true,
      order: {
        id: order.id,
        customerName: order.customer_name,
        amount: order.amount,
        newStatus: order.status,
        profileUpdated: order.status === "paid",
      },
    };
  },
};
