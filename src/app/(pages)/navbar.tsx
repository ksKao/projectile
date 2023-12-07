"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { FaGear } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useEffect, useState } from "react";
import { Avatar } from "~/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

export default function Navbar() {
	const { signOut } = useClerk();
	const router = useRouter();
	const { user } = useUser();
	const { theme, setTheme } = useTheme();
	const [isClient, setIsClient] = useState(false); // for hydration error

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<nav className="w-screen h-24 bg-background flex justify-between items-center px-8 md:px-12 lg:px-16">
			<Link href="/" className="flex items-center gap-2 md:gap-4">
				<Image src="/logo.png" alt="Logo" width={40} height={40} />
				<h1 className="font-bold text-xl select-none">Projectile</h1>
			</Link>
			<DropdownMenu>
				<DropdownMenuTrigger asChild className="block md:hidden">
					{user ? (
						<Avatar className="w-9 h-9">
							<AvatarImage
								src={user.imageUrl}
								alt={user.username ?? user.id}
							/>
						</Avatar>
					) : (
						<Skeleton className="w-9 h-9 rounded-full" />
					)}
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-fit">
					<DropdownMenuGroup>
						<DropdownMenuItem
							onClick={() => {
								setTheme(theme === "dark" ? "light" : "dark");
							}}
						>
							Toggle Theme
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => router.push("/settings")}
						>
							Settings
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={async () => {
								router.replace("/sign-in");
								await signOut();
							}}
						>
							Log Out
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<div className="hidden md:flex items-center gap-2 md:gap-4">
				{isClient && (
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
				)}
				<Button
					onClick={() => router.push("/settings")}
					variant="outline"
				>
					<FaGear className="w-4 h-4" />
				</Button>

				{user ? (
					<Avatar className="w-9 h-9">
						<AvatarImage
							src={user.imageUrl}
							alt={user.username ?? user.id}
						/>
					</Avatar>
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
