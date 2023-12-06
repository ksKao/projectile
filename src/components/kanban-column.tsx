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

type Column = inferRouterOutputs<AppRouter>["kanban"]["getColumns"][number];

function AddCardForm({
	column,
	setShow,
	setOrderedData,
}: {
	column: Column;
	setShow: (show: boolean) => void;
	setOrderedData: React.Dispatch<React.SetStateAction<Column>>;
}) {
	const divRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const project = useProject();
	const router = useRouter();
	const { isLoading, mutate } = api.kanban.addTask.useMutation({
		onError: (e) => {
			if (e.data?.zodError) {
				const errors = e.data.zodError.fieldErrors;
				toast.error(
					errors?.projectId?.[0] ?? errors?.kanbanColumnId?.[0] ?? "",
				);
			} else {
				toast.error(e.message);
			}
			router.refresh();
		},
		onSettled: () => router.refresh(),
	});
	const [cardTitle, setCardTitle] = useState("");

	const addTask: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		const newData = {
			id: crypto.randomUUID(),
			title: cardTitle,
			projectId: project?.id ?? "",
			kanbanColumnId: column.id,
		};
		mutate(newData);

		// optimistic update
		setOrderedData((prev) => {
			const newTasks = Array.from(prev.tasks);

			const max =
				newTasks.length > 0
					? newTasks.reduce(function (prev, current) {
							return prev && prev.sortOrder > current.sortOrder
								? prev
								: current;
					  }).sortOrder
					: 0;

			newTasks.push({
				...newData,
				assignedMembers: [] as string[],
				createdAt: new Date(),
				updatedAt: new Date(),
				dueDate: null,
				description: null,
				sortOrder: max + 1,
			});

			return {
				...prev,
				tasks: newTasks,
			};
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
	}, [setShow]); // Empty dependency array ensures the effect runs only once during mount and unmount

	return (
		<div
			className="w-full mb-2 bg-primary-foreground dark:bg-slate-800 rounded-md p-2"
			ref={divRef}
		>
			<form onSubmit={addTask}>
				<Input
					type="text"
					placeholder="Card Title"
					ref={inputRef}
					value={cardTitle}
					onChange={(e) => setCardTitle(e.target.value)}
				/>
				<div className="-mt-3 flex justify-start gap-2">
					<Button loading={isLoading}>Add Card</Button>
					<Button
						variant="ghost"
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

export default function KanbanColumn({ column }: { column: Column }) {
	const dummyDiv = useRef<HTMLDivElement>(null);
	const [showForm, setShowForm] = useState(false);
	const [orderedData, setOrderedData] = useState<Column>(column);

	useEffect(() => {
		setOrderedData(column);
	}, [column]);

	return (
		<div className="flex flex-col min-w-[16rem] h-fit max-h-full bg-input dark:bg-primary-foreground w-64 pb-2 border dark:border-0 rounded-md overflow-y-hidden">
			<h2 className="font-bold p-2 whitespace-nowrap max-w-full overflow-ellipsis overflow-hidden">
				{orderedData.name}
			</h2>
			<div className="flex-grow max-h-[calc(100%-40px-16px)] overflow-y-auto px-2 mt-2">
				{orderedData.tasks.map((t) => (
					<TaskCard key={t.id} task={t} />
				))}
				{showForm && (
					<AddCardForm
						column={orderedData}
						setShow={setShowForm}
						setOrderedData={setOrderedData}
					/>
				)}
				<div ref={dummyDiv} className="w-full" />
			</div>
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
}
