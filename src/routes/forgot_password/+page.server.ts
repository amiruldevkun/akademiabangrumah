import { fail } from "@sveltejs/kit";
import { TURNSTILE_KEY } from "$env/static/private";

async function verifyTurnstileToken(token: string, key: string) {
  const verifyBody = new URLSearchParams({
    response: token,
    secret: key,
  });
  try {
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: verifyBody,
      },
    );
    const outcome = await verifyRes.json();
    return outcome;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return {
      success: false,
      "error-codes": ["internal-error"],
    };
  }
}

export const actions = {
  default: async ({ request, locals, url, platform }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const turnstileToken = formData.get("cf-turnstile-response") as string;
    const turnstilekey = TURNSTILE_KEY;

    if (!turnstilekey) {
      throw new Error("Key is undefined. Please debug me");
    }

    // Cloudflare Turnstile Implementation via Explicit Rendering
    // 1. Verify token
    if (!turnstileToken) {
      return fail(400, {
        emailError: "Sila selesaikan pengesahan keselamatan.",
      });
    }

    // 2. Call verifyTurnstileToken
    const outcome = await verifyTurnstileToken(turnstileToken, turnstilekey);

    if (!outcome.success) {
      return fail(400, {
        emailError: "Pengesahan keselamatan gagal. Cuba lagi.",
      });
    }

    console.log("Turnstile token verified. Advancing");

    // 3. Validate email format BEFORE calling Supabase
    if (!email || !email.includes("@gmail.com")) {
      return fail(400, { emailError: "Bentuk email tak betul" });
    }

    // Supabase forgot pass flow
    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${url.origin}/auth/reset_password`,
    });

    if (error) {
      console.error("resetPasswordForEmail failed:", error.message);
      return fail(400, {
        emailError: "Tidak dapat menghantar permintaan. Cuba lagi sebentar.",
      });
    }

    return { success: true };
  },
};
