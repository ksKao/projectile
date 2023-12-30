import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z
			.string()
			.url()
			.refine(
				(str) => !str.includes("YOUR_MYSQL_URL_HERE"),
				"You forgot to change the default URL",
			),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		SUPABASE_SERVICE_ROLE_KEY: z.string(),
		TEST1_USER_ID: z.string(),
		TEST2_USER_ID: z.string(),
		TEST3_USER_ID: z.string(),
		TEST4_USER_ID: z.string(),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
		NEXT_PUBLIC_SUPABASE_URL: z.string(),
		NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY: z.string(),
		NEXT_PUBLIC_EXAMPLE_ACCOUNT_EMAIL: z.string().email(),
		NEXT_PUBLIC_EXAMPLE_ACCOUNT_PASSWORD: z.string(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY:
			process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
		NEXT_PUBLIC_EXAMPLE_ACCOUNT_EMAIL:
			process.env.NEXT_PUBLIC_EXAMPLE_ACCOUNT_EMAIL,
		NEXT_PUBLIC_EXAMPLE_ACCOUNT_PASSWORD:
			process.env.NEXT_PUBLIC_EXAMPLE_ACCOUNT_PASSWORD,
		TEST1_USER_ID: process.env.TEST1_USER_ID,
		TEST2_USER_ID: process.env.TEST2_USER_ID,
		TEST3_USER_ID: process.env.TEST3_USER_ID,
		TEST4_USER_ID: process.env.TEST4_USER_ID,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined.
	 * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
