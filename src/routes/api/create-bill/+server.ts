/* eslint-disable @typescript-eslint/no-unused-vars */
// src/routes/api/create-bill/+server.js
//
// POST { phone } -> creates a "pending" order in Supabase, tied to the
// currently logged-in user, and asks ToyyibPay for a bill.
//
// Identity (user_id, name, email) comes from the authenticated session —
// not the request body — since the customer already logged in via Google
// before reaching this page. Only phone still comes from the form, since
// Google doesn't give you that.

import { json, error } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "$lib/supabaseAdmin";
import { createBill } from "$lib/toyyibpay";
import {
  product_name,
  product_description,
  product_amountRM,
} from "$lib/productMeta.json";

// TODO: replace with your real product, or look this up from a products
// table if you sell more than one thing.
const PRODUCT = {
  name: product_name,
  description: product_description,
  amountRM: product_amountRM,
};

export async function POST({ request, locals, url }) {
  const { user } = await locals.safeGetSession();
  if (!user) {
    throw error(401, "Must be logged in to start checkout");
  }

  const { name, phone } = await request.json();
  if (!name || !phone) {
    throw error(400, "name and phone are required");
  }

  const email = user.email;
  const orderId = randomUUID();

  // 1. Write a pending order first, so we have a record even if the
  //    customer abandons checkout on ToyyibPay's page.
  const { error: insertError } = await supabaseAdmin.from("orders").insert({
    id: orderId,
    user_id: user.id,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    product_name: PRODUCT.name,
    amount: PRODUCT.amountRM,
    currency: "MYR",
    status: "pending",
  });

  if (insertError) {
    console.error("Supabase insert error:", insertError);
    throw error(500, "Could not create order");
  }

  // COMMENT THIS WHEN PUSHING TO PROD STUPID
  const origin = url.origin;

  // 2. Ask ToyyibPay for a bill for that order.
  try {
    const { billCode, paymentUrl } = await createBill({
      billName: PRODUCT.name,
      billDescription: PRODUCT.description,
      amountRM: PRODUCT.amountRM,
      customerName: name,
      customerEmail: email as string,
      customerPhone: phone,
      externalReferenceNo: orderId,
      returnUrl: `${origin}/payment/return`,
      callbackUrl: `${origin}/payment/callback`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ toyyibpay_bill_code: billCode })
      .eq("id", orderId);

    return json({ paymentUrl });
  } catch (err) {
    console.error("ToyyibPay createBill error:", err);
    await supabaseAdmin
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId);
    throw error(502, "Could not start payment with ToyyibPay");
  }
}
