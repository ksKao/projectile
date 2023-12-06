"use client";
import React, { useEffect, useRef, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { Button } from "./ui/button";
import { FaPlus } from "react-icons/fa";
import { Input } from "./ui/input";
import { IoCloseSharp } from "react-icons/io5";
import TaskCard from "./task-card";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { useProject } from "~/lib/contexts/projectContext";
import { useRouter } from "next/navigation";
import { Draggable, Droppable } from "@hello-pangea/dnd";

type Column = inferRouterOutputs<AppRouter>["kanban"]["getColumns"][number];

function AddCardForm({
	column,
	setShow,
}: {
	column: Column;
	setShow: (show: boolean) => void;
}) {
	const divRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const project = useProject();
	const router = useRouter();
	const { isLoading, mutate } = api.kanban.addTask.useMutation({
		onSuccess: () => {
			toast.success("A new card has been added");
		},
		onError: (e) => {
			if (e.data?.zodError) {
				const errors = e.data.zodError.fieldErrors;
				toast.error(
					errors?.projectId?.[0] ?? errors?.kanbanColumnId?.[0] ?? "",
				);
			} else {
				toast.error(e.message);
			}
		},
		onSettled: () => {
			inputRef.current?.focus();
			router.refresh();
		},
	});
	const [cardTitle, setCardTitle] = useState("");

	const addTask: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		if (!cardTitle) return;

		mutate({
			id: crypto.randomUUID(),
			title: cardTitle,
			projectId: project?.id ?? "",
			kanbanColumnId: column.id,
		});
		setCardTitle("");
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Check if the clicked element is outside the div
			if (
				divRef.current &&
				!divRef.current.contains(event.target as Node)
			) {
				setCardTitle("");
				setShow(false);
			}
		};

		// Attach the event listener when the component mounts
		document.addEventListener("click", handleClickOutside);

		divRef.current?.scrollIntoView();
		inputRef.current?.focus();

		// Clean up the event listener when the component unmounts
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [setShow]);

	return (
		<div
			className={`w-full mb-2 bg-primary-foreground dark:bg-slate-800 ${
				isLoading ? "opacity-50" : ""
			} rounded-md p-2`}
			ref={divRef}
		>
			<form onSubmit={addTask}>
				<Input
					type="text"
					disabled={isLoading}
					placeholder="Card Title"
					ref={inputRef}
					value={cardTitle}
					onChange={(e) => setCardTitle(e.target.value)}
				/>
				<div className="-mt-3 flex justify-start gap-2">
					<Button disabled={isLoading}>Add Card</Button>
					<Button
						variant="ghost"
						disabled={isLoading}
						className="p-2 hover:bg-slate-600/50"
						type="reset"
						onClick={() => setShow(false)}
					>
						<IoCloseSharp className="h-6 w-6" />
					</Button>
				</div>
			</form>
		</div>
	);
}

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

	return (
		<Draggable draggableId={column.id} index={index}>
			{(provided) => {
				return (
					<div
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						ref={provided.innerRef}
						className="flex flex-col min-w-[16rem] h-fit max-h-full bg-input dark:bg-primary-foreground w-64 pb-2 border dark:border-0 rounded-md overflow-hidden"
					>
						<h2 className="font-bold p-2 whitespace-nowrap max-w-full overflow-ellipsis overflow-hidden">
							{column.name}
						</h2>
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
										className="flex-grow max-h-[calc(100%-40px-16px)] overflow-auto px-2 mt-2"
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
