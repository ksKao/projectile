import { type inferRouterOutputs } from "@trpc/server";
import React from "react";
import { type AppRouter } from "~/server/api/root";
import ReplyCard from "./reply-card";

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
	activeReplyFormId: string;
	setActiveReplyFormId: React.Dispatch<React.SetStateAction<string>>;
}) {
	const filteredReplies = replies.filter((r) => r.parentId === parentId);

	return (
		<div className="ml-2 mb-2">
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
