import { type inferRouterOutputs } from "@trpc/server";
import React from "react";
import { type AppRouter } from "~/server/api/root";
import ReplyCard from "./reply-card";

type Replies = inferRouterOutputs<AppRouter>["threads"]["getThread"]["replies"];

export default function ThreadReplies({
	replies,
	parentId = null,
}: {
	replies: Replies;
	parentId?: string | null;
}) {
	const filteredReplies = replies.filter((r) => r.parentId === parentId);

	return (
		<div className="ml-4 mb-2">
			{filteredReplies.map((r) => (
				<ReplyCard key={r.id} reply={r} allReplies={replies} />
			))}
		</div>
	);
}
