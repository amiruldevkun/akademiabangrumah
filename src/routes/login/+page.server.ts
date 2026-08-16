import { TURNSTILE_KEY } from "$env/static/private";
import { fail } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

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
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const emailInput = formData.get("email") as string;
    const emailPass = formData.get("pass") as string;
    const turnstileToken = formData.get("cf-turnstile-response") as string;
    let passError = "" as string;
    let emailError = "" as string;
    let signUpStatus = true as boolean;

    // Cloudflare Turnstile Implementation via Explicit Rendering

    // 1. Verify the token exist and not null
    if (!turnstileToken) {
      return fail(400, { error: "ts missing sonion ✌️😭🥀🥀" });
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

    // Supabase login flow
    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email: emailInput,
      password: emailPass,
      options: {},
    });
    console.log(error, data);
    if (error?.message.includes("Password")) {
      return fail(
        400,
        (passError =
          "Kata laluan mestilah sepanjang 6 huruf atau/dan memerlukan 1 huruf besar, 1 huruf kecil, 1 simbol(!,@,$) dan 1 nombor"),
      );
    } else if (error?.message.includes("invalid format")) {
      return fail(
        400,
        (emailError = "Email bukan format yang diingini. Perbetulkan email."),
      );
    } else if (error?.message.includes("requires")) {
      return fail(400, (passError = "Letakkan kata laluan"));
    } else if (error?.message.includes("Anonymous")) {
      let message = "Email dan kata laluan kosong";
      return fail(400, ((passError = message), (emailError = message)));
    } else if (error) {
      console.log(error);
      return fail(400, (passError = "Email atau kata laluan salah"));
    }
    redirect(303, "/");
  },
};

// let passError = "";
//   let emailError = "";
//   let signUpStatus = true;
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email: emailInput,
//     password: emailPass,
//     options: {},
//   });
//   console.log(error, data);
//   if (error?.message.includes("Password")) {
//     passError =
//       "Kata laluan mestilah sepanjang 6 huruf atau/dan memerlukan 1 huruf besar, 1 huruf kecil, 1 simbol(!,@,$) dan 1 nombor";
//   } else if (error?.message.includes("invalid format")) {
//     emailError = "Email bukan format yang diingini. Perbetulkan email.";
//   } else if (error?.message.includes("requires")) {
//     passError = "Letakkan kata laluan";
//   } else if (error?.message.includes("Anonymous")) {
//     let message = "Email dan kata laluan kosong";
//     passError = message;
//     emailError = message;
//   } else if (error) {
//     passError = "Email atau kata laluan salah";
//   } else {
//     window.location.href = "/";
//   }

//   signUpStatus = false;
