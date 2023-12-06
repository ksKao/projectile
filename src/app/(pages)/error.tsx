"use client"; // Error components must be Client Components

export default function Error({
	error,
}: {
	error: Error & { digest?: string };
}) {
	return (
		<div className="w-full h-full flex items-center justify-center flex-col max-w-full">
			<h1 className="mb-2 text-2xl font-bold">Error</h1>
			<h2 className="text-xl font-semibold text-center">
				{error.message}
			</h2>
		</div>
	);
}
