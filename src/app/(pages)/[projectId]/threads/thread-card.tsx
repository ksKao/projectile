"use client";
import React from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "~/components/ui/card";
import { formatDistanceStrict } from "date-fns";
import { useProject } from "~/lib/contexts/projectContext";
import { Avatar, AvatarImage } from "~/components/ui/avatar";

type ThreadWithNumberOfReplies =
	inferRouterOutputs<AppRouter>["threads"]["getThreads"][number];

export default function ThreadCard({
	thread,
}: {
	thread: ThreadWithNumberOfReplies;
}) {
	const project = useProject();

	const author = project.members.find((m) => m.id === thread.author);

	if (!author) throw new Error("Author of post not found in member.");

	return (
		<Card className="p-4 max-w-[calc(100vw-17rem-64px)] mt-4">
			{/* 17 rem = width of sidebar, 64 px = padding of side bar, 64px = padding of content */}
			<div className="flex gap-4 items-center">
				<Avatar>
					<AvatarImage src={author.imageUrl} />
				</Avatar>
				<div className="max-w-full min-w-0">
					<CardTitle className="mb-1 truncate w-full">
						{thread.title}
					</CardTitle>
					<CardDescription>
						{formatDistanceStrict(thread.createdAt, Date.now(), {
							addSuffix: true,
						})}{" "}
						· {author.username}
					</CardDescription>
				</div>
			</div>
			<CardContent className="p-0 mt-4 max-w-full">
				<p className="truncate min-w-0 text-muted-foreground">
					{thread.content.replace(/<[^>]*>/g, "")}
				</p>
			</CardContent>
		</Card>
	);
}
