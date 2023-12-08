"use client";
import { useState } from "react";
import { TbFileDescription } from "react-icons/tb";
import Tiptap from "~/components/tiptap";

export default function TaskDescription({
	taskDescription,
}: {
	taskDescription: string;
}) {
	const [showEditor, setShowEditor] = useState(taskDescription.length !== 0);

	return (
		<>
			<div className="flex flex-row items-center space-y-0 my-2 gap-4 min-w-0 mt-4">
				<span>
					<TbFileDescription className="w-7 h-7" />
				</span>
				<h2 className="text-lg font-semibold truncate">Description</h2>
			</div>
			{showEditor ? (
				<Tiptap
					save={() => {
						console.log("mutate");
					}}
					content={taskDescription}
				/>
			) : (
				<div
					role="button"
					className="w-full bg-muted hover:bg-muted/70 p-4 rounded-md"
					onClick={() => setShowEditor(true)}
				>
					<p>Add a description...</p>
				</div>
			)}
		</>
	);
}
