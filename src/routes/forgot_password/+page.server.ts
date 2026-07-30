export const actions = {
  default: async ({ request, locals, url }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    let signupStatus = true as boolean;

    const { data, error } = await locals.supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${url.origin}auth/reset_password` },
    );

    signupStatus = false;
    return { success: true, signupStatus };
  },
};
