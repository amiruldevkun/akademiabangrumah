import { supabaseAdmin } from "$lib/supabaseAdmin";
import { fail } from "@sveltejs/kit";

export const actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("conPass") as string;
    const name = formData.get("name") as string;
    let signupStatus = true as boolean;
    if (password !== passwordConfirm) {
      return fail(400, {
        passError: "Kata laluan tidak sama. Pastikan kata laluan sama",
      });
    }

    const { data, error } = await locals.supabase.auth.signUp({
      email: email,
      password: password,

      options: {
        emailRedirectTo: "/login",
        data: {
          full_name: name,
          name: name,
        },
      },
    });

    if (data.user && data.user.identities?.length === 0) {
      return fail(400, {
        emailError: "Email ini sudah didaftarkan. Sila log masuk.",
      });
    }

    console.log(JSON.stringify(data.user, null, 2));

    if (error) {
      if (error?.message.includes("Password")) {
        return fail(400, {
          passError:
            "Kata laluan mestilah sepanjang 6 huruf atau/dan memerlukan 1 huruf besar, 1 huruf kecil, 1 simbol(!,@,$) dan 1 nombor",
        });
      } else if (error?.message.includes("invalid format")) {
        return fail(400, {
          emailError: "Email bukan format yang diingini. Perbetulkan email.",
        });
      } else if (error?.message.includes("requires")) {
        return fail(400, { passError: "Letakkan kata laluan" });
      } else if (error?.message.includes("Anonymous")) {
        let message = "Email dan kata laluan kosong";
        return fail(400, { emailError: message, passError: message });
      } else if (data.user) {
        console.log("user data exist, need to verify email");
      } else if (data.session) {
        console.log("session and verification exist, need to redirect");
      }
    }

    if (data.user) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ full_name: name })
        .eq("id", data.user.id);

      if (profileError)
        console.error("Failed to set full_name:", profileError.message);
    }
    signupStatus = false;
    return { success: true, signupStatus };
  },
};
