import React from "react";
import { Card, CardContent } from "~/components/ui/card";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pt-4 w-96 max-w-[80%]">
			<CardContent>{children}</CardContent>
		</Card>
	);
}
