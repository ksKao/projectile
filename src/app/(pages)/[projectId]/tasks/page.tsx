import React from "react";
import Kanban from "~/components/kanban";
import { api } from "~/trpc/server";

export default async function TasksPage({
	params,
}: {
	params: { projectId: string };
}) {
	const columns = await api.kanban.getColumns.query(params.projectId);

	return (
		<div className="max-h-full h-full">
			<h1 className="text-2xl font-bold">Task Board</h1>
			<Kanban columns={columns} />
		</div>
	);
}
