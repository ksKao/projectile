import React from "react";
import AddColumnButton from "~/components/add-column-button";
import KanbanColumn from "~/components/kanban-column";
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
			<div className="pt-4 max-h-[calc(100%-2rem)] h-full flex gap-x-3 w-fit pr-8">
				{columns.map((c) => (
					<KanbanColumn key={c.id} column={c} />
				))}
				<AddColumnButton />
			</div>
		</div>
	);
}
