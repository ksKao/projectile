"use client";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export default function ToggleThemeButton() {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			onClick={() => {
				setTheme(theme === "dark" ? "light" : "dark");
			}}
			variant="outline"
		>
			{theme === "dark" ? (
				<MdDarkMode className="w-4 h-4" />
			) : (
				<MdLightMode className="w-4 h-4" />
			)}
		</Button>
	);
}
