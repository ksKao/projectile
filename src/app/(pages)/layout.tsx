import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("~/components/navbar"), { ssr: false });

export default function PagesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Navbar />
			<main className="mx-8 md:mx-12 lg:mx-16">{children}</main>
		</>
	);
}
