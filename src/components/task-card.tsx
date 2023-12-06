import { Draggable } from "@hello-pangea/dnd";
import { type Tasks } from "@prisma/client";
import React from "react";

export default function TaskCard({
	task,
	index,
}: {
	task: Tasks;
	index: number;
}) {
	return (
		<Draggable draggableId={task.id} index={index}>
			{(provided) => {
				return (
					<div
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						ref={provided.innerRef}
						className="w-full p-2 mb-2 bg-primary-foreground dark:bg-input rounded-md"
					>
						{task.title}
					</div>
				);
			}}
		</Draggable>
	);
}
