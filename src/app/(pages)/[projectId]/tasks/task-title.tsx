"use client";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiTask } from "react-icons/bi";
import { Input } from "~/components/ui/input";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";

export default function TaskTitle({
	taskId,
	taskTitle,
}: {
	taskId: string;
	taskTitle: string;
}) {
	const [editing, setEditing] = useState(false);
	const [newTaskTitle, setNewTaskTitle] = useState(taskTitle);
	const inputRef = useRef<HTMLInputElement>(null);
	const utils = api.useUtils();
	const { isLoading, mutate } = api.kanban.modifyTaskTitle.useMutation({
		onSuccess: () => {
			toast.success("Task title updated successfully");
			setEditing(false);
		},
		onError: (e) =>
			toast.error(
				e.data?.zodError?.fieldErrors.title?.[0] ??
					e.data?.zodError?.fieldErrors.taskId?.[0] ??
					e.message,
			),
		onSettled: async () => await utils.kanban.getColumns.invalidate(),
	});

	useEffect(() => {
		if (editing && inputRef.current) inputRef.current.focus();
	}, [editing]);

	return (
		<>
			<div
				role="button"
				onClick={() => setEditing(true)}
				hidden={editing}
			>
				<div
					className={`flex items-center space-y-0 gap-4 min-w-0 min-h-[40px]`}
				>
					<span>
						<BiTask className="w-7 h-7" />
					</span>
					<h2 className="text-xl font-bold truncate">{taskTitle}</h2>
				</div>
			</div>
			<div hidden={!editing} className="w-full relative">
				<Input
					ref={inputRef}
					value={newTaskTitle}
					onChange={(e) => setNewTaskTitle(e.target.value)}
					className="-mb-5 font-bold text-xl"
					onBlur={() => {
						if (!newTaskTitle || newTaskTitle === taskTitle) {
							setEditing(false);
							return;
						}
						mutate({
							taskId,
							title: newTaskTitle,
						});
					}}
					disabled={isLoading}
				/>
				{isLoading && (
					<div className="absolute right-2 top-1/2 -translate-y-1/2">
						<LoadingSpinner className="w-7 h-7" />
					</div>
				)}
			</div>
		</>
	);
}
