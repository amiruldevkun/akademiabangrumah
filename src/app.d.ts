import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import 'vite-plugin-pwa/info';
import 'vite-plugin-pwa/client';

declare global {
    namespace App {
        interface Locals {
            supabase: SupabaseClient;
            safeGetSession: ()=> Promise<{ user: User | null; session: Session | null }>;
            session: Session | null;
            user: User | null;
        }
    }

    interface Window {
        YT?: {
            Player: new (
                element: string | HTMLElement,
                options: Record<string, unknown>
            ) => {
                destroy: () => void;
                getCurrentTime: () => number;
                getDuration: () => number;
                seekTo: (seconds: number, allowSeekAhead: boolean) => void;
            };
            PlayerState: {
                PLAYING: number;
                PAUSED: number;
                ENDED: number;
            };
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}