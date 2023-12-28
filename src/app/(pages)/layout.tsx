import { currentUser } from "@clerk/nextjs";
import Navbar from "./navbar";
import { redirect } from "next/navigation";

export default async function PagesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await currentUser();

	console.log("Layout running");

	if (!user) redirect("/sign-in");

	return (
		<>
			<Navbar />
			<main className="mx-8 md:mx-12 h-[calc(100svh-96px)] flex flex-col">
				{children}
			</main>
		</>
	);
}
