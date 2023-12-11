"use client";
import React, { useState } from "react";
import ThreadReplies from "./thread-replies";
import { type AppRouter } from "~/server/api/root";
import { type inferRouterOutputs } from "@trpc/server";

type Replies = inferRouterOutputs<AppRouter>["threads"]["getThread"]["replies"];

export type ActiveReplyForm = {
	id: string;
	mode: "reply" | "edit";
};

export default function ThreadRepliesWrapper({
	threadReplies,
}: {
	threadReplies: Replies;
}) {
	const [activeReplyFormId, setActiveReplyFormId] = useState<ActiveReplyForm>(
		{
			id: "",
			mode: "reply",
		},
	);

	return (
		<div className="pb-4 -ml-4 md:pb-0">
			<ThreadReplies
				replies={threadReplies}
				activeReplyForm={activeReplyFormId}
				setActiveReplyForm={setActiveReplyFormId}
			/>
		</div>
	);
}
