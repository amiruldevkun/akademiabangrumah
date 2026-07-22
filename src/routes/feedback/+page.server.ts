export async function load ({locals}) {
        const { user } = await locals.safeGetSession();

        return {
            userEmail : user?.email ?? null,
        };
}