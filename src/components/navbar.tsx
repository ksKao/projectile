"use client";
import { useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function Navbar() {
	const { theme, setTheme } = useTheme();
	const { signOut } = useClerk();
	const { replace } = useRouter();

	return (
		<nav className="w-screen h-24 bg-background">
			<button
				onClick={() => {
					setTheme(theme === "dark" ? "light" : "dark");
				}}
			>
				Change Theme
			</button>
			<Button
				onClick={async () => {
					await signOut();
					replace("/sign-in");
				}}
			>
				Log Out
			</Button>
		</nav>
	);
}
