import Navbar from "./navbar";

export default function PagesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Navbar />
			<main className="mx-8 md:mx-12 h-[calc(100svh-96px)]">
				{children}
			</main>
		</>
	);
}
