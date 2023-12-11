"use client";

import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import Tiptap from "~/components/tiptap";
import { api } from "~/trpc/react";

export default function CommentForm({ threadId }: { threadId: string }) {
	const router = useRouter();
	const { isLoading, mutate } = api.threads.createReply.useMutation({
		onSuccess: () => router.refresh(),
		onError: (e) => {
			const error = e.data?.zodError?.fieldErrors;
			toast.error(
				error?.content?.[0] ??
					error?.threadId?.[0] ??
					error?.parentId?.[0] ??
					e.message,
			);
		},
	});

	return (
		<div className="mt-4 rounded-md bg-muted/50 p-4">
			<Tiptap
				editable
				content=""
				onSubmit={(editor) => {
					if (editor.getText().length !== 0)
						mutate({
							threadId,
							content: editor.getHTML(),
							parentId: null,
						});
					editor.commands.setContent("");
				}}
				isSubmitting={isLoading}
				placeholder="Write a comment..."
			/>
		</div>
	);
}
