import { type inferRouterOutputs } from "@trpc/server";
import React from "react";
import { type AppRouter } from "~/server/api/root";
import ReplyCard from "./reply-card";
import { type ActiveReplyForm } from "./thread-replies-wrapper";

type Replies = inferRouterOutputs<AppRouter>["threads"]["getThread"]["replies"];

export default function ThreadReplies({
	replies,
	parentId = null,
	depth = 1,
	activeReplyFormId,
	setActiveReplyFormId,
}: {
	replies: Replies;
	parentId?: string | null;
	depth?: number;
	activeReplyFormId: ActiveReplyForm;
	setActiveReplyFormId: React.Dispatch<React.SetStateAction<ActiveReplyForm>>;
}) {
	const filteredReplies = replies.filter((r) => r.parentId === parentId);

	return (
		<div className="ml-4 mb-2">
			{filteredReplies.map((r) => (
				<ReplyCard
					key={r.id}
					reply={r}
					allReplies={replies}
					depth={depth}
					activeReplyFormId={activeReplyFormId}
					setActiveReplyFormId={setActiveReplyFormId}
				/>
			))}
		</div>
	);
}
