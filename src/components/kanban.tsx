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
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useProject } from "~/lib/contexts/projectContext";
import toast from "react-hot-toast";

type Column = inferRouterOutputs<AppRouter>["kanban"]["getColumns"][number];

export default function Kanban({ columns }: { columns: Column[] }) {
	const [orderedData, setOrderedData] = useState(columns);
	const { mutate: sortColumn } = api.kanban.sortColumn.useMutation({
		onError: (e) => {
			if (e.data?.zodError) {
				const errors = e.data.zodError.fieldErrors;
				toast.error(
					errors?.sortedColumns?.[0] ?? errors?.projectId?.[0] ?? "",
				);
			} else {
				toast.error(e.message);
			}
		},
		onSettled: () => router.refresh(),
	});
	const { isLoading, mutate: updateTaskOrder } =
		api.kanban.updateTaskOrder.useMutation({
			onError: (e) => {
				if (e.data?.zodError) {
					const errors = e.data.zodError.fieldErrors;
					toast.error(
						errors?.sortedColumns?.[0] ??
							errors?.projectId?.[0] ??
							"",
					);
				} else {
					toast.error(e.message);
				}
			},
			onSettled: () => router.refresh(),
		});
	const router = useRouter();
	const project = useProject();

	useEffect(() => {
		setOrderedData(columns);
	}, [columns]);

	function reorder<T>(list: T[], startIndex: number, endIndex: number) {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		removed && result.splice(endIndex, 0, removed);

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
			sortColumn({
				projectId: project?.id ?? "",
				sortedColumns: items.map((i) => {
					return { ...i };
				}),
			});
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
				updateTaskOrder({
					projectId: project?.id ?? "",
					tasks: reorderedTasks.map((t) => {
						return {
							...t,
						};
					}),
				});
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

				destColumn.tasks.forEach((task, i) => {
					task.sortOrder = i;
				});

				setOrderedData(newOrderedData);
				updateTaskOrder({
					projectId: project?.id ?? "",
					tasks: [
						...sourceColumn.tasks.map((t) => {
							return {
								...t,
							};
						}),
						...destColumn.tasks.map((t) => {
							return {
								...t,
							};
						}),
					],
				});
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
							<KanbanColumn
								key={c.id}
								index={i}
								column={c}
								isLoading={isLoading}
							/>
						))}
						{provided.placeholder}
						<AddColumnButton />
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}
