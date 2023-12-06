"use client";
import React from "react";
import Kanban from "~/components/kanban";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";

export default function TasksPage({
	params,
}: {
	params: { projectId: string };
}) {
	const {
		isLoading,
		isError,
		data: columns,
	} = api.kanban.getColumns.useQuery(params.projectId);

	if (isLoading)
		return (
			<div className="w-full h-full flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	if (isError) throw new Error();

	return (
		<div className="max-h-full h-full">
			<h1 className="text-2xl font-bold">Task Board</h1>
			<Kanban columns={columns} />
		</div>
	);
}
