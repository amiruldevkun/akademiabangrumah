import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";

export const POST = async (event) => {
  const {
    request,
    locals: { supabase },
  } = event;
  const formData = await request.formData();
  const token_hash = formData.get("token_hash") as string;
  const type = formData.get("type") as EmailOtpType | null;
  const next = (formData.get("next") as string) ?? "/";

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      redirect(303, new URL(event.url.origin + next));
    }
  }

  // return the user to an error page with some instructions
  redirect(303, "/auth/error");
};
