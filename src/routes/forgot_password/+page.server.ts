import { fail } from "@sveltejs/kit";
import { TURNSTILE_KEY } from "$env/static/private";

async function verifyTurnstileToken(token: string) {
  const verifyBody = new URLSearchParams({
    response: token,
    secret: TURNSTILE_KEY,
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
  default: async ({ request, locals, url }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const turnstileToken = formData.get("cf-turnstile-response") as string;
    let emailError = "" as string;
    let signupStatus = true as boolean;

    // Cloudflare Turnstile Implementation via Explicit Rendering
    // 1. Verify token
    if (!turnstileToken) {
      return fail(400, { error: "ts missing" });
    }

    // 2. Call verifyTurnstileToken
    const outcome = await verifyTurnstileToken(turnstileToken);

    if (!outcome.success) {
      return fail(400, {
        error: "An error has occured",
        codes: outcome["error-codes"],
      });
    }

    console.log("Turnstile token verified. Advancing");

    // Supabase forgot pass flow
    const { data, error } = await locals.supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${url.origin}auth/reset_password` },
    );

    if (!email.includes("@gmail.com")) {
      emailError = "Bentuk Email tak betul";
      return fail(400, { emailError });
    }
    signupStatus = false;
    return { success: true, signupStatus };
  },
};
