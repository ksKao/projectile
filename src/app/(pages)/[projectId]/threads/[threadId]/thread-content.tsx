"use client";
import type { inferRouterOutputs } from "@trpc/server";
import { formatDistanceStrict } from "date-fns";
import React from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { FaRegClock, FaRegComment } from "react-icons/fa6";
import Tiptap from "~/components/tiptap";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Card, CardTitle } from "~/components/ui/card";
import { useProject } from "~/lib/contexts/projectContext";
import type { AppRouter } from "~/server/api/root";

type Thread = inferRouterOutputs<AppRouter>["threads"]["getThread"];

export default function TheadContent({ thread }: { thread: Thread }) {
	const project = useProject();
	const author = project.members.find((m) => m.id === thread.author);

	return (
		<Card className="p-4">
			<div className="flex items-center gap-4">
				<Avatar>
					<AvatarImage
						src={author?.imageUrl}
						alt={author?.username ?? "Removed member"}
					/>
					<AvatarFallback>N/A</AvatarFallback>
				</Avatar>
				<CardTitle className="font-bold text-2xl">
					{thread.title}
				</CardTitle>
			</div>
			<div className="my-8">
				<Tiptap
					editable={false}
					content={thread.content}
					onSubmit={() => {
						console.log("submit");
					}}
					role={"none"}
					isSubmitting={false}
					className="border-0 p-0"
				/>
			</div>
			<div className="items-center flex gap-6 text-muted-foreground mt-4">
				<span className="inline-flex items-center gap-2">
					<FaRegUserCircle />
					{author?.username ?? "Removed"}
				</span>
				<span className="inline-flex items-center gap-2 truncate">
					<FaRegClock />
					{formatDistanceStrict(thread.createdAt, Date.now(), {
						addSuffix: true,
					})
						.split("")
						.map((char, index) =>
							index === 0 ? char.toUpperCase() : char,
						)
						.join("")}
				</span>
				<span className="inline-flex items-center gap-2">
					<FaRegComment /> {thread.replies.length}
				</span>
			</div>
		</Card>
	);
}
