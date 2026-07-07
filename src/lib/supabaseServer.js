import { createServerClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";

export const createServer = (cookies) =>{
    return createServerClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return cookies.getAll();
                },

                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value, options }) => {
                        cookies.set(name, value, {...options, path: '/'})
                    })
                },
            },
        }       
    )
};