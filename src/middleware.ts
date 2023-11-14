import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
	publicRoutes: ["/password-reset"],
	afterAuth(auth, req, evt) {
		// if user is signed in and browsing to public route, redirect to home page
		if (auth.userId && auth.isPublicRoute)
			return NextResponse.redirect(new URL("/", req.url));
		else if (!auth.userId && !auth.isPublicRoute) {
			return NextResponse.redirect(new URL("/sign-in", req.url));
		}
	},
});

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
