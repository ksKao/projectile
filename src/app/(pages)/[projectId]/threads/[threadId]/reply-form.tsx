"use client";

import { type Editor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Tiptap from "~/components/tiptap";
import { api } from "~/trpc/react";

export default function ReplyForm({ threadId }: { threadId: string }) {
	const router = useRouter();
	const [editor, setEditor] = useState<Editor | null>(null);
	const { isLoading, mutate } = api.threads.createReply.useMutation({
		onSuccess: () => {
			editor?.commands.setContent("");
			router.refresh();
		},
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
		<div className="rounded-md max-w-full bg-muted/40 p-4">
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
					setEditor(editor);
				}}
				isSubmitting={isLoading}
				placeholder="Write a comment..."
			/>
		</div>
	);
}
