"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { TbFileDescription } from "react-icons/tb";
import Tiptap from "~/components/tiptap";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function TaskDescription({
	taskId,
	taskDescription,
}: {
	taskId: string;
	taskDescription: string;
}) {
	const utils = api.useUtils();
	const { isLoading, mutate } = api.kanban.modifyTaskDescription.useMutation({
		onSuccess: () => {
			toast.success("Task description updated successfully");
			setEditable(false);
		},
		onError: (e) =>
			toast.error(e.data?.zodError?.fieldErrors.taskId?.[0] ?? e.message),
		onSettled: () => utils.kanban.getColumns.invalidate(),
	});
	const [showEditor, setShowEditor] = useState(taskDescription.length !== 0);
	const [editable, setEditable] = useState(false);

	return (
		<>
			<div className="flex justify-between w-full items-center mb-2 mt-4">
				<div className="flex flex-row items-center space-y-0 gap-4 min-w-0">
					<span>
						<TbFileDescription className="w-7 h-7" />
					</span>
					<h2 className="text-lg font-semibold truncate">
						Description
					</h2>
				</div>
				<Button
					onClick={() => {
						setEditable(true);
						setShowEditor(true);
					}}
					className={editable ? "invisible" : ""}
				>
					Edit
				</Button>
			</div>
			{showEditor ? (
				<Tiptap
					editable={editable}
					setEditable={setEditable}
					isSubmitting={isLoading}
					onSubmit={(editor) => {
						mutate({
							taskId,
							description: editor.getHTML(),
						});
					}}
					content={taskDescription}
					onCancel={(editor) => {
						setEditable?.(false);
						editor.commands.setContent(taskDescription);
						if (editor.getText().length === 0 && setShowEditor)
							setShowEditor(false);
					}}
				/>
			) : (
				<div
					role="button"
					className="w-full bg-muted hover:bg-muted/70 p-4 rounded-md"
					onClick={() => {
						setShowEditor(true);
						setEditable(true);
					}}
				>
					<p>Add a description...</p>
				</div>
			)}
		</>
	);
}
