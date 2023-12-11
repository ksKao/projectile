"use client";
import { type inferRouterOutputs } from "@trpc/server";
import React, { useState } from "react";
import { type AppRouter } from "~/server/api/root";
import ThreadReplies from "./thread-replies";
import { useProject } from "~/lib/contexts/projectContext";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatDistanceStrict } from "date-fns";
import Tiptap from "~/components/tiptap";
import { Button } from "~/components/ui/button";
import { MdDelete, MdModeEdit, MdOutlineReply } from "react-icons/md";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { type Editor } from "@tiptap/react";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { type ActiveReplyForm } from "./thread-replies-wrapper";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";

type Reply =
	inferRouterOutputs<AppRouter>["threads"]["getThread"]["replies"][number];

export default function ReplyCard({
	allReplies,
	reply,
	depth = 1,
	activeReplyForm,
	setActiveReplyForm,
}: {
	allReplies: Reply[];
	reply: Reply;
	depth?: number;
	activeReplyForm: ActiveReplyForm;
	setActiveReplyForm: React.Dispatch<React.SetStateAction<ActiveReplyForm>>;
}) {
	const project = useProject();
	const { isSignedIn, user } = useUser();
	const router = useRouter();
	const [editor, setEditor] = useState<Editor | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const { isLoading: isCreatingReply, mutate: createReply } =
		api.threads.createReply.useMutation({
			onSuccess: () => {
				setActiveReplyForm({
					id: "",
					mode: "reply",
				});
				router.refresh();
			},
			onError: (e) => {
				const error = e.data?.zodError?.fieldErrors;
				toast.error(
					error?.content?.[0] ??
						error?.threadId?.[0] ??
						error?.parentId?.[0] ??
						e.message,
				);
			},
		});
	const { isLoading: isUpdatingReply, mutate: updateReply } =
		api.threads.updateReply.useMutation({
			onSuccess: () => {
				editor?.commands.setContent("");
				setActiveReplyForm({
					id: "",
					mode: "reply",
				});
				router.refresh();
			},
			onError: (e) => {
				const error = e.data?.zodError?.fieldErrors;
				toast.error(
					error?.content?.[0] ?? error?.replyId?.[0] ?? e.message,
				);
			},
		});
	const { isLoading: isDeletingReply, mutate: deleteReply } =
		api.threads.deleteReply.useMutation({
			onSuccess: () => {
				setDeleteModalOpen(false);
				router.refresh();
			},
			onError: (e) => toast.error(e.message),
		});

	const author = project.members.find((m) => m.id === reply.author);

	if (!isSignedIn) redirect("/sign-in");

	return (
		<div
			className={`${
				reply.parentId ? "border-l-[1px]" : "border mt-4 rounded-md"
			}`}
		>
			<div className="p-4">
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
							{formatDistanceStrict(reply.updatedAt, Date.now(), {
								addSuffix: true,
							})}{" "}
							{reply.createdAt.getTime() !==
							reply.updatedAt.getTime()
								? "(edited)"
								: null}
						</span>
					</div>
				</div>
				<div className="my-4">
					{!reply.deleted ? (
						<Tiptap
							content={reply.content}
							editable={
								activeReplyForm.id === reply.id &&
								activeReplyForm.mode === "edit"
							}
							role="none"
							onSubmit={(editor) => {
								if (editor.getText().length > 0)
									updateReply({
										replyId: reply.id,
										content: editor.getHTML(),
									});
							}}
							isSubmitting={isUpdatingReply}
							onCancel={() =>
								setActiveReplyForm({
									id: "",
									mode: "reply",
								})
							}
							className={
								activeReplyForm.id === reply.id &&
								activeReplyForm.mode === "edit"
									? ""
									: "border-0"
							}
						/>
					) : (
						<p className="text-muted-foreground px-2">[deleted]</p>
					)}
				</div>
				{(activeReplyForm.mode !== "reply" ||
					activeReplyForm.id !== reply.id) &&
				!reply.deleted ? (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild disabled>
								<span tabIndex={0}>
									<Button
										variant="ghost"
										className="h-8 w-20"
										onClick={() =>
											setActiveReplyForm({
												id: reply.id,
												mode: "reply",
											})
										}
										disabled={depth >= 5}
									>
										<span className="mr-2">
											<MdOutlineReply />
										</span>
										Reply
									</Button>
								</span>
							</TooltipTrigger>
							<TooltipContent hidden={depth < 5}>
								Reply chain is too deep
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				) : null}
				{reply.author === user.id && !reply.deleted ? (
					<>
						{activeReplyForm.mode !== "edit" ||
						activeReplyForm.id !== reply.id ? (
							<Button
								variant="ghost"
								className="h-8 w-20"
								onClick={() =>
									setActiveReplyForm({
										id: reply.id,
										mode: "edit",
									})
								}
							>
								<span className="mr-2">
									<MdModeEdit />
								</span>
								Edit
							</Button>
						) : null}
						<Dialog
							open={deleteModalOpen}
							onOpenChange={setDeleteModalOpen}
						>
							<DialogTrigger asChild>
								<Button variant="ghost" className="h-8 w-20">
									<span className="mr-2">
										<MdDelete />
									</span>
									Delete
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>Confirm Delete?</DialogTitle>
								Are you sure you want to delete this reply?
								<div className="w-full flex justify-end items-center gap-2">
									<Button
										variant="outline"
										onClick={() =>
											setDeleteModalOpen(false)
										}
									>
										Cancel
									</Button>
									<Button
										variant="destructive"
										loading={isDeletingReply}
										onClick={() => deleteReply(reply.id)}
									>
										Delete
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					</>
				) : null}
			</div>
			{activeReplyForm.id === reply.id &&
				activeReplyForm.mode === "reply" && (
					<div className="mx-6 mb-4 mt-2 rounded-md p-4 bg-muted/40 border">
						<Tiptap
							editable
							content=""
							onSubmit={(editor) => {
								if (editor.getText().length !== 0)
									createReply({
										threadId: reply.threadId,
										content: editor.getHTML(),
										parentId: reply.id,
									});
								setEditor(editor);
							}}
							onCancel={() =>
								setActiveReplyForm({
									id: "",
									mode: "reply",
								})
							}
							isSubmitting={isCreatingReply}
							placeholder="Reply something..."
						/>
					</div>
				)}
			<ThreadReplies
				replies={allReplies}
				parentId={reply.id}
				depth={depth + 1}
				activeReplyForm={activeReplyForm}
				setActiveReplyForm={setActiveReplyForm}
			/>
		</div>
	);
}
