import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { Card, CardContent } from "~/components/ui/card";

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// const user = await currentUser();
	// if (user) redirect("/");

	return (
		<Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pt-4 w-96 max-w-[80%]">
			<CardContent>{children}</CardContent>
		</Card>
	);
}
