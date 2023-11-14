import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "react-hot-toast";
import Navbar from "~/components/navbar";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata = {
	title: "Projectile",
	description: "A project management app for students",
	icons: [{ rel: "icon", url: "/logo.png" }],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body className={`font-sans ${inter.variable} bg-background`}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<TRPCReactProvider headers={headers()}>
							<Toaster position="top-center" />
							{children}
						</TRPCReactProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
