"use client";
import React, { useRef, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { Button } from "@/components/ui/button";
import { FaPlus, FaTrash } from "react-icons/fa";
import TaskCard from "./task-card";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import ColumnName from "./column-name";
import AddCardForm from "./add-card-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";

type Column = inferRouterOutputs<AppRouter>["kanban"]["getColumns"][number];

export default function KanbanColumn({
	column,
	index,
	isLoading,
}: {
	column: Column;
	index: number;
	isLoading: boolean;
}) {
	const dummyDiv = useRef<HTMLDivElement>(null);
	const [showForm, setShowForm] = useState(false);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const utils = api.useUtils();
	const { isLoading: isDeleting, mutate } =
		api.kanban.deleteColumn.useMutation({
			onSuccess: () => {
				toast.success("Column has been deleted");
				setShowDeleteConfirmation(false);
			},
			onError: (e) => {
				toast.error(e.data?.zodError?.formErrors?.[0] ?? e.message);
			},
			onSettled: () => utils.kanban.getColumns.invalidate(),
		});

	return (
		<Draggable draggableId={column.id} index={index}>
			{(provided) => {
				return (
					<div
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						ref={provided.innerRef}
						className="flex flex-col min-w-[20rem] h-fit max-h-full bg-input dark:bg-primary-foreground w-80 pb-2 border dark:border-0 rounded-md overflow-hidden"
					>
						<div className="flex items-center p-2 gap-2">
							<ColumnName
								columnId={column.id}
								columnName={column.name}
							/>
							<Dialog
								open={showDeleteConfirmation}
								onOpenChange={setShowDeleteConfirmation}
							>
								<DialogTrigger asChild>
									<Button variant="ghost">
										<FaTrash className="w-4 h-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader className="font-bold text-lg">
										Confirm Delete
									</DialogHeader>
									Are you sure that you want to delete this
									column? All tasks under this column will
									also be deleted.
									<div className="w-full flex justify-end items-center gap-2">
										<Button
											variant="ghost"
											onClick={() =>
												setShowDeleteConfirmation(false)
											}
										>
											Cancel
										</Button>
										<Button
											variant="destructive"
											onClick={() => {
												mutate(column.id);
											}}
											loading={isDeleting}
										>
											Delete
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</div>
						<Droppable
							droppableId={column.id}
							type="card"
							isDropDisabled={isLoading}
						>
							{(provided) => {
								return (
									<div
										{...provided.droppableProps}
										ref={provided.innerRef}
										className="flex-grow max-h-[calc(100%-40px-16px)] overflow-auto mt-2 px-2"
									>
										{column.tasks.map((t, i) => (
											<TaskCard
												key={t.id}
												task={t}
												index={i}
											/>
										))}
										{provided.placeholder}
										{showForm && (
											<AddCardForm
												column={column}
												setShow={setShowForm}
											/>
										)}
										<div
											ref={dummyDiv}
											className="w-full"
										/>
									</div>
								);
							}}
						</Droppable>
						<Button
							variant="ghost"
							className={`m-2 mb-0 px-2 font-semibold justify-start ${
								showForm ? "hidden" : ""
							}`}
							onClick={() => {
								setShowForm(true);
								dummyDiv.current?.scrollIntoView({
									behavior: "smooth",
									block: "end",
								});
							}}
						>
							<FaPlus className="mr-2" /> Add a card
						</Button>
					</div>
				);
			}}
		</Draggable>
	);
}
