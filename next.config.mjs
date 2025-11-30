/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
	images: {
		remotePatterns: [
			{
				hostname: "img.clerk.com",
			},
			{
				hostname: "projectile-supabase-8b09cb-46-62-225-140.traefik.me",
			},
		],
	},
};

export default config;
