import { createClient } from "@supabase/supabase-js";
import { env } from "~/env.mjs";

export const supabaseClient = createClient(
	env.NEXT_PUBLIC_SUPABASE_URL,
	env.NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY,
);
