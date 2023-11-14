import Navbar from "~/components/navbar";

export default function PagesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Navbar />
			<main>{children}</main>
		</>
	);
}
