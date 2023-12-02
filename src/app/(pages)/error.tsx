"use client"; // Error components must be Client Components

export default function Error({
	error,
}: {
	error: Error & { digest?: string };
}) {
	return (
		<div className="w-full h-full flex items-center justify-center">
			<h1 className="text-xl font-bold">{error.message}</h1>
		</div>
	);
}
