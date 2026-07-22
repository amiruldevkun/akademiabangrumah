import { createServerClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import type { Cookies } from "@sveltejs/kit";

export const createServer = (cookies : Cookies) =>{
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