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
			<main className="px-8 md:px-12 h-[calc(100svh-96px)] flex flex-col overflow-y-auto scrollbar-hide md:scrollbar-default overflow-x-hidden">
				{children}
			</main>
		</>
	);
}
