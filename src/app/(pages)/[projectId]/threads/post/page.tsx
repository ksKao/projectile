"use client";
import { notFound, useRouter } from "next/navigation";
import React, { useState } from "react";
import Tiptap from "~/components/tiptap";
import { Input } from "~/components/ui/input";
import { useProject } from "~/lib/contexts/projectContext";

export default function PostPage() {
	const maxTitleChar = 100;
	const router = useRouter();
	const project = useProject();
	const [title, setTitle] = useState("");

	if (!project) notFound();

	return (
		<>
			<h1 className="text-2xl font-bold">Create a new post</h1>
			<label htmlFor="title">
				<h2 className="text-xl font-semibold mt-4">Title</h2>
			</label>
			<Input
				placeholder="Title"
				value={title}
				name="title"
				id="title"
				onChange={(e) => {
					if (e.target.value.length <= maxTitleChar)
						setTitle(e.target.value);
				}}
			/>
			<h2 className="text-xl font-semibold mt-4">Content</h2>
			<div className="mt-4">
				<Tiptap
					content=""
					editable
					onSubmit={(content) => console.log(content.getHTML())}
					isSubmitting={false}
					onCancel={() => router.push(`/${project.id}/threads`)}
				/>
			</div>
		</>
	);
}
