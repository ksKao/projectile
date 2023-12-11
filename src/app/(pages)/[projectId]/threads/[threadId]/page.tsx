import React from "react";
import { api } from "~/trpc/server";
import ThreadContent from "./thread-content";
import ReplyForm from "./reply-form";
import ThreadReplies from "./thread-replies";

export default async function ThreadPage({
	params,
}: {
	params: { threadId: string };
}) {
	const thread = await api.threads.getThread.query(params.threadId);

	return (
		<>
			<ThreadContent thread={thread} />
			<ReplyForm threadId={thread.id} />
			<ThreadReplies replies={thread.replies} />
		</>
	);
}
