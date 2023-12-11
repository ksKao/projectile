import { type inferRouterOutputs } from "@trpc/server";
import React from "react";
import { type AppRouter } from "~/server/api/root";

type Replies = inferRouterOutputs<AppRouter>["threads"]["getThread"]["replies"];

export default function ThreadReplies({
	replies,
	parentId = null,
}: {
	replies: Replies;
	parentId?: string | null;
}) {
	if (replies.length === 0) return null;

	const filteredReplies = replies.filter((r) => r.parentId === parentId);

	return (
		<div className="ml-2">
			{filteredReplies.map((r) => (
				<React.Fragment key={r.id}>
					<p>{r.content}</p>
					<ThreadReplies replies={replies} parentId={r.id} />
				</React.Fragment>
			))}
		</div>
	);
}
