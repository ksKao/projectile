"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { TbFileDescription } from "react-icons/tb";
import Tiptap from "~/components/tiptap";
import { Button } from "~/components/ui/button";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";

export default function TaskDescription({
	taskId,
	taskDescription,
}: {
	taskId: string;
	taskDescription: string;
}) {
	const utils = api.useUtils();
	const [description, setDescription] = useState(taskDescription);
	const [loading, setLoading] = useState(false);
	const { isLoading, mutate } = api.kanban.modifyTaskDescription.useMutation({
		onSuccess: (data) => {
			toast.success("Task description updated successfully");
			setEditable(false);
			setDescription(data);
			if (!data) {
				setShowEditor(false);
			}
		},
		onError: (e) =>
			toast.error(e.data?.zodError?.fieldErrors.taskId?.[0] ?? e.message),
		onSettled: async () => {
			await utils.kanban.getColumns.invalidate();
			setLoading(false);
		},
	});
	const [showEditor, setShowEditor] = useState(description.length !== 0);
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
			{loading ? (
				<div className="w-full flex justify-center">
					<LoadingSpinner />
				</div>
			) : showEditor ? (
				<Tiptap
					editable={editable}
					setEditable={setEditable}
					isSubmitting={isLoading}
					onSubmit={(editor) => {
						const newDesc =
							editor.getText().length === 0
								? ""
								: editor.getHTML();
						mutate({
							taskId,
							description: newDesc,
						});
						setDescription(newDesc);
						setLoading(true);
					}}
					content={description}
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
