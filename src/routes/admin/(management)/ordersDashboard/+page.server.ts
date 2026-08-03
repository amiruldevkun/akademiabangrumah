// src/routes/admin/(management)/ordersDashboard/+page.server.ts

import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { supabaseAdmin } from "$lib/supabaseAdmin";

const VALID_STATUSES = ["paid", "pending", "failed"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

async function requireAdmin(locals: App.Locals) {
  const { user } = await locals.safeGetSession();
  if (!user) error(401, "Not authenticated");

  const { data: profile } = await locals.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) error(403, "Not authorized");

  return user;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  await requireAdmin(locals);

  const statusFilter = url.searchParams.get("status");
  // Strip characters that have special meaning in PostgREST's .or() filter
  // syntax (comma separates conditions, parens are reserved) — a pasted
  // ref number shouldn't ever need these, so stripping is safe.
  const search = (url.searchParams.get("q")?.trim() ?? "").replace(
    /[,()]/g,
    "",
  );

  let query = supabaseAdmin
    .from("orders")
    .select(
      "id, created_at, customer_name, customer_email, customer_phone, product_name, amount, currency, status, toyyibpay_bill_code, toyyibpay_ref_no, paid_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (statusFilter && VALID_STATUSES.includes(statusFilter as OrderStatus)) {
    query = query.eq("status", statusFilter);
  }

  // Match either field — customers usually only have the ref no from their
  // receipt on hand, but support bill code too since that's what shows up
  // in the ToyyibPay merchant dashboard when cross-checking.
  if (search) {
    query = query.or(
      `toyyibpay_bill_code.ilike.%${search}%,toyyibpay_ref_no.ilike.%${search}%`,
    );
  }

  const { data: orders, error: fetchErr } = await query;

  if (fetchErr) {
    console.error("Failed to fetch orders:", fetchErr);
    return { orders: [], statusFilter, search };
  }

  return { orders: orders ?? [], statusFilter, search };
};

export const actions: Actions = {
  updateStatus: async ({ request, locals }) => {
    await requireAdmin(locals);

    const formData = await request.formData();
    const id = formData.get("id");
    const status = formData.get("status");

    if (typeof id !== "string") {
      return fail(400, { message: "Missing order id." });
    }
    if (
      typeof status !== "string" ||
      !VALID_STATUSES.includes(status as OrderStatus)
    ) {
      return fail(400, { message: "Invalid status value." });
    }

    // Only stamp paid_at when moving TO paid — don't touch it for
    // pending/failed so you don't lose the original paid timestamp
    // if someone flips paid -> failed -> paid again.
    const updatePayload: Record<string, unknown> = { status };
    if (status === "paid") {
      updatePayload.paid_at = new Date().toISOString();
    }

    const { error: updateErr } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", id);

    if (updateErr) {
      console.error("Failed to update order status:", updateErr);
      return fail(500, { message: "Could not update status — check logs." });
    }

    return { updated: true, id, status };
  },
};
