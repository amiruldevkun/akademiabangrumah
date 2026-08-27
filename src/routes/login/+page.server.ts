import { fail } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
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
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const emailInput = formData.get("email") as string;
    const emailPass = formData.get("pass") as string;
    const turnstileToken = formData.get("cf-turnstile-response") as string;
    const turnstilekey = TURNSTILE_KEY;

    if (!turnstilekey) {
      throw new Error("Turnstile is undefined. Debug me");
    }

    // Cloudflare Turnstile Implementation via Explicit Rendering

    // 1. Verify the token exist and not null
    if (!turnstileToken) {
      return fail(400, {
        passError: "Sila selesaikan pengesahan keselamatan.",
        emailError: "",
      });
    }

    // 2. Call verifyTurnstileToken
    const outcome = await verifyTurnstileToken(turnstileToken, turnstilekey);

    console.log("Verifying Token...");

    if (!outcome.success) {
      console.log("Turnstile Failed");
      return fail(400, {
        passError: "Pengesahan keselamatan gagal. Cuba lagi.",
        emailError: "",
      });
    }

    console.log("Turnstile token verified. Advancing");

    // Supabase login flow
    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email: emailInput,
      password: emailPass,
      options: {},
    });
    console.log(error, data);

    if (error?.message.includes("Password")) {
      return fail(400, {
        passError:
          "Kata laluan mestilah sepanjang 6 huruf atau/dan memerlukan 1 huruf besar, 1 huruf kecil, 1 simbol(!,@,$) dan 1 nombor",
        emailError: "",
      });
    } else if (error?.message.includes("invalid format")) {
      return fail(400, {
        passError: "",
        emailError: "Email bukan format yang diingini. Perbetulkan email.",
      });
    } else if (error?.message.includes("requires")) {
      return fail(400, {
        passError: "Letakkan kata laluan",
        emailError: "",
      });
    } else if (error?.message.includes("Anonymous")) {
      const message = "Email dan kata laluan kosong";
      return fail(400, {
        passError: message,
        emailError: message,
      });
    } else if (error) {
      console.log(error);
      return fail(400, {
        passError: "Email atau kata laluan salah",
        emailError: "Email atau kata laluan salah",
      });
    }

    redirect(303, "/");
  },
};
