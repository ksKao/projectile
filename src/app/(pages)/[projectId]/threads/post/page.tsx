"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Tiptap from "~/components/tiptap";
import { Input } from "~/components/ui/input";
import { useProject } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/react";

export default function PostPage() {
	const maxTitleChar = 100;
	const router = useRouter();
	const project = useProject();
	const [title, setTitle] = useState("");
	const [titleError, setTitleError] = useState("");
	const { mutate, isLoading } = api.threads.createThread.useMutation({
		onSuccess: () => {
			toast.success("A new thread has been created");
			router.push(`/${project?.id}/threads`);
			router.refresh();
		},
		onError: (e) => {
			const zodError = e.data?.zodError?.fieldErrors;
			toast.error(
				zodError?.title?.[0] ?? zodError?.projectId?.[0] ?? e.message,
			);
		},
	});

	return (
		<>
			<h1 className="text-2xl font-bold">Create a new thread</h1>
			<label htmlFor="title">
				<h2 className="text-xl font-semibold mt-4 mb-1">Title</h2>
			</label>
			<form className="relative">
				<Input
					placeholder="Title"
					value={title}
					name="title"
					id="title"
					errorMessage={titleError}
					onChange={(e) => {
						if (e.target.value.length <= maxTitleChar)
							setTitle(e.target.value);
					}}
				/>
				<span className="text-muted-foreground absolute bottom-0 right-0 text-sm">
					{title.length} / {maxTitleChar}
				</span>
			</form>
			<h2 className="text-xl font-semibold mt-4">Content</h2>
			<div className="mt-4">
				<Tiptap
					content=""
					editable
					onSubmit={(content) => {
						setTitleError("");
						if (title.length === 0) {
							setTitleError("Title is required");
							return;
						}
						mutate({
							projectId: project.id,
							title,
							content:
								content.getText().length === 0
									? ""
									: content.getHTML(),
						});
					}}
					isSubmitting={isLoading}
					onCancel={() => router.push(`/${project.id}/threads`)}
				/>
			</div>
		</>
	);
}
