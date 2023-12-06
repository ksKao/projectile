"use client";

import {
	DragDropContext,
	Droppable,
	type OnDragEndResponder,
} from "@hello-pangea/dnd";
import React from "react";
import AddColumnButton from "./add-column-button";
import KanbanColumn from "./kanban-column";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type Column = inferRouterOutputs<AppRouter>["kanban"]["getColumns"][number];

export default function Kanban({ columns }: { columns: Column[] }) {
	const onDragEnd: OnDragEndResponder = (result) => {
		console.log(result);
	};
	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable
				droppableId="columns"
				type="column"
				direction="horizontal"
			>
				{(provided) => {
					return (
						<div
							className="pt-4 max-h-[calc(100%-2rem)] h-full flex gap-x-3 w-fit pr-8"
							{...provided.droppableProps}
							ref={provided.innerRef}
						>
							{columns.map((c, i) => (
								<KanbanColumn key={c.id} column={c} index={i} />
							))}
							{provided.placeholder}
							<AddColumnButton />
						</div>
					);
				}}
			</Droppable>
		</DragDropContext>
	);
}
