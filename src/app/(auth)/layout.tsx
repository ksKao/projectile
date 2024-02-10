"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";
import { Card, CardContent } from "~/components/ui/card";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = useUser();
	const router = useRouter();

	if (user.isLoaded && user.isSignedIn) router.replace("/");

	if (!user.isLoaded) return <></>;

	return (
		<Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pt-4 w-96 max-w-[80%]">
			<CardContent>{children}</CardContent>
		</Card>
	);
}
