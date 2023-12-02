import LoadingSpinner from "~/components/ui/loading-spinner";

export default function PagesLoading() {
	return (
		<div className="min-w-full h-screen justify-center items-center flex">
			<LoadingSpinner />
		</div>
	);
}
