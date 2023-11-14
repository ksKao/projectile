"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { redirect, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
	const { theme, setTheme } = useTheme();
	const { signOut } = useClerk();
	const { replace } = useRouter();
	const { user } = useUser();

	return (
		<nav className="w-screen h-24 bg-background flex justify-between items-center px-4">
			<Link href="/" className="flex items-center gap-4">
				<Image src="/logo.png" alt="Logo" width={40} height={40} />
				<h1 className="font-bold text-xl select-none">Projectile</h1>
			</Link>
			<div className="flex items-center gap-4">
				<button
					onClick={() => {
						setTheme(theme === "dark" ? "light" : "dark");
					}}
				>
					{theme}
				</button>
				<Image
					src={user?.imageUrl ?? ""}
					alt="User Profile Picture"
					width={36}
					height={36}
					className="rounded-full"
				/>
				<Button
					onClick={async () => {
						replace("/sign-in");
						await signOut();
					}}
				>
					Log Out
				</Button>
			</div>
		</nav>
	);
}
