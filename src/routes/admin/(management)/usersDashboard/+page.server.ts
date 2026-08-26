import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getSupabaseAdmin } from "$lib/supabaseAdmin";

const VALID_STATUSES = ["paid", "pending", "failed"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export const load: PageServerLoad = async ({ locals, url, platform }) => {
  const currentUser = locals.user;
  const statusFilter = url.searchParams.get("status");
  const rawSearch = url.searchParams.get("q")?.trim() ?? "";
  const search = rawSearch.replace(/[,()%]/g, "");
  let searchStatus = false as boolean;

  searchStatus = true;

  const { data: profile, error: profileErr } = await locals.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", currentUser?.id)
    .single();

  if (profileErr || !profile?.is_admin) {
    error(403, "Not authorized");
  }
  // If there's no search query and no status filter, don't run heavy queries
  if (!search && !statusFilter) {
    searchStatus = false;
    return {
      profiles: [],
      orders: [],
      search: "",
      statusFilter: null,
      currentUserId: currentUser?.id,
      searchStatus,
    };
  }

  const supabaseAdmin = getSupabaseAdmin(platform);

  // --- 1. Construct Orders Query ---
  let ordersQuery = supabaseAdmin
    .from("orders")
    .select(
      "id, created_at, customer_name, customer_email, customer_phone, product_name, amount, currency, status, toyyibpay_bill_code, toyyibpay_ref_no, paid_at",
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (statusFilter && VALID_STATUSES.includes(statusFilter as OrderStatus)) {
    ordersQuery = ordersQuery.eq("status", statusFilter);
  }

  if (search) {
    // Search orders by ref no, bill code, or customer email
    ordersQuery = ordersQuery.or(
      `toyyibpay_bill_code.ilike.%${search}%,toyyibpay_ref_no.ilike.%${search}%,customer_email.ilike.%${search}%`,
    );
  }

  // --- 2. Construct Profiles Query ---
  let profilesQuery = supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, has_paid, paid_at, is_admin, created_at")
    .limit(20);

  if (search) {
    profilesQuery = profilesQuery.ilike("email", `%${search}%`);
  } else {
    // Don't fetch profiles if only filtering orders by status without a search term
    profilesQuery = profilesQuery.eq(
      "id",
      "00000000-0000-0000-0000-000000000000",
    );
  }

  // --- 3. Execute concurrently ---
  const [profilesRes, ordersRes] = await Promise.all([
    profilesQuery,
    ordersQuery,
  ]);

  if (profilesRes.error) console.error("Profiles error:", profilesRes.error);
  if (ordersRes.error) console.error("Orders error:", ordersRes.error);
  searchStatus = false;

  return {
    profiles: profilesRes.data ?? [],
    orders: ordersRes.data ?? [],
    search: rawSearch,
    statusFilter,
    currentUserId: currentUser?.id,
    searchStatus,
  };
};

export const actions: Actions = {
  toggleAdmin: async ({ request, locals, platform }) => {
    const currentUser = locals.user;
    const formData = await request.formData();

    const id = formData.get("id");

    if (typeof id !== "string")
      return fail(400, { message: "Missing user id." });

    if (id === currentUser?.id) {
      return fail(400, {
        message: "You can't change your own admin status here.",
      });
    }

    const supabaseAdmin = getSupabaseAdmin(platform);

    const { data: target, error: readErr } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", id)
      .single();

    if (readErr || !target) return fail(404, { message: "User not found." });

    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({ is_admin: !target.is_admin })
      .eq("id", id);

    if (updateErr)
      return fail(500, { message: "Could not update profile — check logs." });

    return { toggled: "admin", id };
  },

  toggleHasPaid: async ({ request, locals, platform }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    if (typeof id !== "string")
      return fail(400, { message: "Missing user id." });

    const supabaseAdmin = getSupabaseAdmin(platform);

    const { data: target, error: readErr } = await supabaseAdmin
      .from("profiles")
      .select("has_paid")
      .eq("id", id)
      .single();

    if (readErr || !target) return fail(404, { message: "User not found." });

    const nextHasPaid = !target.has_paid;
    const updatePayload: Record<string, unknown> = { has_paid: nextHasPaid };
    if (nextHasPaid) updatePayload.paid_at = new Date().toISOString();

    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("id", id);

    if (updateErr)
      return fail(500, { message: "Could not update payment access." });

    return { toggled: "paid", id };
  },

  updateStatus: async ({ request, platform }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    const status = formData.get("status");

    if (typeof id !== "string")
      return fail(400, { message: "Missing order id." });
    if (
      typeof status !== "string" ||
      !VALID_STATUSES.includes(status as OrderStatus)
    ) {
      return fail(400, { message: "Invalid status value." });
    }

    const updatePayload: Record<string, unknown> = { status };
    if (status === "paid") updatePayload.paid_at = new Date().toISOString();

    const supabaseAdmin = getSupabaseAdmin(platform);

    const { error: updateErr } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", id);

    if (updateErr)
      return fail(500, { message: "Could not update status — check logs." });

    return { updated: true, id, status };
  },
};
