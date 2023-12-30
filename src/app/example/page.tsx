import { currentUser } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { env } from "~/env.mjs";
import ExampleAccountSetup from "./example-account-setup";

export default async function ExamplePage() {
	const user = await currentUser();

	if (!user) redirect("/sign-in");
	if (
		user.emailAddresses?.[0]?.emailAddress !==
		env.NEXT_PUBLIC_EXAMPLE_ACCOUNT_EMAIL
	)
		notFound();

	return (
		<Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pt-4 w-96 max-w-[80%]">
			<CardContent>
				<ExampleAccountSetup />
			</CardContent>
		</Card>
	);
}
