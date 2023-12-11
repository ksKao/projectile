"use client";
import React, { useState } from "react";
import ThreadReplies from "./thread-replies";
import { type AppRouter } from "~/server/api/root";
import { type inferRouterOutputs } from "@trpc/server";

type Replies = inferRouterOutputs<AppRouter>["threads"]["getThread"]["replies"];

export default function ThreadRepliesWrapper({
	threadReplies,
}: {
	threadReplies: Replies;
}) {
	const [activeReplyFormId, setActiveReplyFormId] = useState("");

	return (
		<div className="mt-4 -ml-4">
			<ThreadReplies
				replies={threadReplies}
				activeReplyFormId={activeReplyFormId}
				setActiveReplyFormId={setActiveReplyFormId}
			/>
		</div>
	);
}
