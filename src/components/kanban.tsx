"use client";

import {
	DragDropContext,
	Droppable,
	type OnDragEndResponder,
} from "@hello-pangea/dnd";
import React, { useEffect, useState } from "react";
import AddColumnButton from "./add-column-button";
import KanbanColumn from "./kanban-column";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type Column = inferRouterOutputs<AppRouter>["kanban"]["getColumns"][number];

export default function Kanban({ columns }: { columns: Column[] }) {
	const [orderedData, setOrderedData] = useState(columns);

	useEffect(() => {
		setOrderedData(columns);
	}, [columns]);

	function reorder<T>(list: T[], startIndex: number, endIndex: number) {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		removed && result.splice(endIndex, 0, removed);
		// if (removed) {
		// 	result.splice(endIndex, 0, removed);
		// } else {
		// 	result.splice(endIndex, 0);
		// }

		return result;
	}

	const onDragEnd: OnDragEndResponder = (result) => {
		const { destination, source, type } = result;

		if (!destination) return;

		// if dropped in the same position
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		)
			return;

		// user moves a column
		if (type === "column") {
			const items = reorder(
				orderedData,
				source.index,
				destination.index,
			).map((item, index) => ({
				...item,
				sortOrder: index,
			}));
			setOrderedData(items);
			// TODO: call db
		}

		if (type === "card") {
			const newOrderedData = [...orderedData];

			const sourceColumn = newOrderedData.find(
				(c) => c.id === source.droppableId,
			);
			const destColumn = newOrderedData.find(
				(c) => c.id === destination.droppableId,
			);

			if (!sourceColumn || !destColumn) return;

			// Moving the card in the same column
			if (source.droppableId === destination.droppableId) {
				const reorderedTasks = reorder(
					sourceColumn.tasks,
					source.index,
					destination.index,
				);

				reorderedTasks.forEach((card, i) => {
					card.sortOrder = i;
				});

				sourceColumn.tasks = reorderedTasks;

				setOrderedData(newOrderedData);
				// TODO call db
			} else {
				// Moving card to a different column
				// Remove card from source column
				const [movedCard] = sourceColumn.tasks.splice(source.index, 1);

				if (!movedCard) return;

				// Assign the new column ID to the moved card
				movedCard.kanbanColumnId = destination.droppableId;

				// Add card to the destination column
				destColumn.tasks.splice(destination.index, 0, movedCard);

				sourceColumn.tasks.forEach((task, i) => {
					task.sortOrder = i;
				});

				setOrderedData(newOrderedData);
				// TODO call db
			}
		}
	};
	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable
				droppableId="columns"
				type="column"
				direction="horizontal"
			>
				{(provided) => (
					<div
						className="pt-4 max-h-[calc(100%-2rem)] h-full flex gap-x-3 w-fit pr-8"
						{...provided.droppableProps}
						ref={provided.innerRef}
					>
						{orderedData.map((c, i) => (
							<KanbanColumn key={c.id} index={i} column={c} />
						))}
						{provided.placeholder}
						<AddColumnButton />
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}
