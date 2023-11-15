"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { FaGear } from "react-icons/fa6";
import { Skeleton } from "./ui/skeleton";
import dynamic from "next/dynamic";

const ToggleThemeButton = dynamic(
	() => import("@/components/toggle-theme-button"),
	{ ssr: false },
);

export default function Navbar() {
	const { signOut } = useClerk();
	const router = useRouter();
	const { user } = useUser();

	return (
		<nav className="w-screen h-24 bg-background flex justify-between items-center px-8 md:px-12 lg:px-16">
			<Link href="/" className="flex items-center gap-4">
				<Image src="/logo.png" alt="Logo" width={40} height={40} />
				<h1 className="font-bold text-xl select-none">Projectile</h1>
			</Link>
			<div className="flex items-center gap-4">
				<ToggleThemeButton />
				<Button
					onClick={() => router.push("/settings")}
					variant="outline"
				>
					<FaGear className="w-4 h-4" />
				</Button>

				{user ? (
					<Image
						src={user.imageUrl ?? ""}
						alt="User Profile Picture"
						width={36}
						height={36}
						className="rounded-full"
					/>
				) : (
					<Skeleton className="w-9 h-9 rounded-full" />
				)}
				<Button
					onClick={async () => {
						router.replace("/sign-in");
						await signOut();
					}}
				>
					Log Out
				</Button>
			</div>
		</nav>
	);
}
