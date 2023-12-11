"use client";
import React from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { formatDistanceStrict } from "date-fns";
import { useProject } from "~/lib/contexts/projectContext";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { FaRegClock, FaRegComment } from "react-icons/fa6";
import { FaRegUserCircle } from "react-icons/fa";
import Link from "next/link";

type ThreadWithNumberOfReplies =
	inferRouterOutputs<AppRouter>["threads"]["getThreads"][number];

export default function ThreadCard({
	thread,
}: {
	thread: ThreadWithNumberOfReplies;
}) {
	const project = useProject();

	const author = project.members.find((m) => m.id === thread.author);

	return (
		<Link href={`/${project.id}/threads/${thread.id}`}>
			<Card className="p-4 max-w-[calc(100vw-17rem-64px)] min-w-full mt-4">
				{/* 17 rem = width of sidebar, 64 px = padding of side bar, 64px = padding of content */}
				<div className="flex gap-4 items-center">
					<Avatar>
						<AvatarImage src={author?.imageUrl} />
						<AvatarFallback>N/A</AvatarFallback>
					</Avatar>
					<div className="max-w-full min-w-0">
						<CardTitle className="mb-1 truncate w-full">
							{thread.title}
						</CardTitle>
					</div>
				</div>
				<CardContent className="p-0 mt-4 max-w-full">
					<p className="truncate min-w-0">
						{thread.content.replace(/<[^>]*>/g, "")}
					</p>
					<div className="items-center flex gap-6 text-muted-foreground mt-4">
						<span className="inline-flex items-center gap-2">
							<FaRegUserCircle />
							{author?.username ?? "Removed"}
						</span>
						<span className="inline-flex items-center gap-2 truncate">
							<FaRegClock />
							{formatDistanceStrict(
								thread.createdAt,
								Date.now(),
								{
									addSuffix: true,
								},
							)
								.split("")
								.map((char, index) =>
									index === 0 ? char.toUpperCase() : char,
								)
								.join("")}
						</span>
						<span className="inline-flex items-center gap-2">
							<FaRegComment /> {thread.numberOfReplies}
						</span>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
