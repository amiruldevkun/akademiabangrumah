// src/routes/+page.server.ts
export async function load({ locals }) {
  const { user } = await locals.safeGetSession();

  return {
    userEmail: user?.email ?? null,
    suggestedName: user?.user_metadata?.full_name ?? "",
  };
}

export const prerender = true;
