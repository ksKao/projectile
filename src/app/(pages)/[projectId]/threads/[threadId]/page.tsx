import React from "react";
import { api } from "~/trpc/server";
import ThreadContent from "./thread-content";
import ReplyForm from "./reply-form";
import ThreadRepliesWrapper from "./thread-replies-wrapper";

export default async function ThreadPage({
	params,
}: {
	params: { threadId: string };
}) {
	const thread = await api.threads.getThread.query(params.threadId);

	return (
		<>
			<ThreadContent thread={thread} />
			<div className="my-6">
				<ReplyForm threadId={thread.id} />
			</div>
			<ThreadRepliesWrapper threadReplies={thread.replies} />
		</>
	);
}
