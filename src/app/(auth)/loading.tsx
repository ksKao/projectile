import LoadingSpinner from "~/components/ui/loading-spinner";

export default function AuthPagesLoading() {
	return (
		<div className="flex min-h-full w-full items-center justify-center">
			<LoadingSpinner />
		</div>
	);
}
