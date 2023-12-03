import React from "react";
import LoadingSpinner from "~/components/ui/loading-spinner";

export default function ProjectLoading() {
	return (
		<div className="w-full flex justify-center items-center">
			<LoadingSpinner />
		</div>
	);
}
