"use client";
import { useTheme } from "next-themes";

export default function Navbar() {
	const { theme, setTheme } = useTheme();

	return (
		<nav className="w-screen h-24 bg-background">
			<button
				onClick={() => {
					setTheme(theme === "dark" ? "light" : "dark");
				}}
			>
				Change Theme
			</button>
		</nav>
	);
}
