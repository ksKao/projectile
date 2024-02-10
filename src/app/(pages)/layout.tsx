"use client";
import { useUser } from "@clerk/nextjs";
import Navbar from "./navbar";
import { useRouter } from "next/navigation";

export default function PagesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = useUser();
	const router = useRouter();

	if (user.isLoaded && !user.isSignedIn) router.replace("/sign-in");

	if (!user.isLoaded) return <></>;

	return (
		<>
			<Navbar />
			<main className="px-8 md:px-12 h-[calc(100svh-96px)] flex flex-col overflow-y-auto scrollbar-hide md:scrollbar-default overflow-x-hidden">
				{children}
			</main>
		</>
	);
}
