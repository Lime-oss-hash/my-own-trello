"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";

type SupabaseContext = {
  supabase: SupabaseClient | null;
  isLoaded: boolean;
};
const Context = createContext<SupabaseContext>({
  supabase: null,
  isLoaded: false,
});

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Memoize the Supabase client to prevent recreation on every render
  // Only recreate when session ID changes, not on every session object update
  const supabase = useMemo(() => {
    if (!session) return null;

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          // Get the Supabase token with a custom fetch method
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken();

            // Insert the Clerk Supabase token into the headers
            const headers = new Headers(options?.headers);
            if (clerkToken) {
              headers.set("Authorization", `Bearer ${clerkToken}`);
            }

            // Call the default fetch
            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
      }
    );

    return client;
  }, [session?.id]); // Only recreate when session ID changes

  useEffect(() => {
    if (supabase) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [supabase]);

  return (
    <Context.Provider value={{ supabase, isLoaded }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase needs to be inside the provider");
  }

  return context;
};
