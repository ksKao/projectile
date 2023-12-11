import React from "react";
import { api } from "~/trpc/server";
import ThreadContent from "./thread-content";
import CommentForm from "./comment-form";

export default async function ThreadPage({
	params,
}: {
	params: { threadId: string };
}) {
	const thread = await api.threads.getThread.query(params.threadId);

	return (
		<>
			<ThreadContent thread={thread} />
			<CommentForm />
		</>
	);
}
