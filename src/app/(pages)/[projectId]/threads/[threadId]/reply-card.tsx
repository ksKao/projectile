"use client";
import { type inferRouterOutputs } from "@trpc/server";
import React from "react";
import { type AppRouter } from "~/server/api/root";
import ThreadReplies from "./thread-replies";
import { useProject } from "~/lib/contexts/projectContext";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatDistanceStrict } from "date-fns";
import Tiptap from "~/components/tiptap";
import { Button } from "~/components/ui/button";
import { MdDelete, MdModeEdit, MdOutlineReply } from "react-icons/md";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

type Reply =
	inferRouterOutputs<AppRouter>["threads"]["getThread"]["replies"][number];

export default function ReplyCard({
	allReplies,
	reply,
}: {
	allReplies: Reply[];
	reply: Reply;
}) {
	const project = useProject();
	const { isSignedIn, user } = useUser();

	const author = project.members.find((m) => m.id === reply.author);

	if (!isSignedIn) redirect("/sign-in");

	return (
		<div className={`${reply.parentId ? "" : "border mt-4"} rounded-md`}>
			<div className="p-2">
				<div className="flex gap-2 items-center">
					<Avatar>
						<AvatarImage
							src={author?.imageUrl}
							alt={author?.username ?? "Removed User"}
						/>
						<AvatarFallback>N/A</AvatarFallback>
					</Avatar>
					<div>
						<h3 className="font-semibold">
							{author?.username ?? "Removed User"}
						</h3>
						<span className="text-muted-foreground text-sm">
							{formatDistanceStrict(reply.createdAt, Date.now(), {
								addSuffix: true,
							})}
						</span>
					</div>
				</div>
				<Tiptap
					content={reply.content}
					editable={false}
					role="none"
					className="border-0"
				/>
				<Button variant="ghost" className="h-8 w-20">
					<span className="mr-2">
						<MdOutlineReply />
					</span>
					Reply
				</Button>
				{reply.author === user.id ? (
					<>
						<Button variant="ghost" className="h-8 w-20">
							<span className="mr-2">
								<MdModeEdit />
							</span>
							Edit
						</Button>
						<Button variant="ghost" className="h-8 w-20">
							<span className="mr-2">
								<MdDelete />
							</span>
							Delete
						</Button>
					</>
				) : null}
			</div>
			<ThreadReplies replies={allReplies} parentId={reply.id} />
		</div>
	);
}
