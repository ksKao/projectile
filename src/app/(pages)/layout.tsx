import { currentUser } from "@clerk/nextjs";
import Navbar from "./navbar";
import { redirect } from "next/navigation";

export default async function PagesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await currentUser();

	if (!user) redirect("/sign-in");

	return (
		<>
			<Navbar />
			<main className="mx-8 md:mx-12 lg:mx-16 h-[calc(100svh-96px)]">
				{children}
			</main>
		</>
	);
}
