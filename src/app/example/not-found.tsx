import Link from "next/link";

export default function NotFound() {
	return (
		<div className="w-full h-screen flex items-center justify-center flex-col">
			<h1 className="font-bold text-xl">This page does not exist.</h1>
			<p>
				Return to{" "}
				<Link href="/" className="hover:underline text-primary">
					Home
				</Link>
			</p>
		</div>
	);
}
