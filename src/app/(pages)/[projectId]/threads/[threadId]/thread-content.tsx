"use client";
import { useUser } from "@clerk/nextjs";
import type { inferRouterOutputs } from "@trpc/server";
import { formatDistanceStrict } from "date-fns";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaRegUserCircle } from "react-icons/fa";
import { FaEllipsis, FaRegClock, FaRegComment } from "react-icons/fa6";
import { MdDelete, MdModeEdit } from "react-icons/md";
import Tiptap from "~/components/tiptap";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { useProject } from "~/lib/contexts/projectContext";
import type { AppRouter } from "~/server/api/root";
import { api } from "~/trpc/react";

type Thread = inferRouterOutputs<AppRouter>["threads"]["getThread"];

export default function TheadContent({ thread }: { thread: Thread }) {
	const maxTitleChar = 100;
	const project = useProject();
	const router = useRouter();
	const { user, isSignedIn } = useUser();
	const author = project.members.find((m) => m.id === thread.author);
	const [editing, setEditing] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [title, setTitle] = useState(thread.title);
	const [titleError, setTitleError] = useState("");
	const { isLoading: editThreadLoading, mutate: editThread } =
		api.threads.editThread.useMutation({
			onSuccess: () => {
				setEditing(false);
				router.refresh();
			},
			onError: (e) => {
				const error = e.data?.zodError?.fieldErrors;
				toast.error(
					error?.title?.[0] ?? error?.threadId?.[0] ?? e.message,
				);
			},
		});
	const { isLoading: deleteThreadLoading, mutate: deleteThread } =
		api.threads.deleteThread.useMutation({
			onSuccess: () => {
				toast.success("This thread has been deleted");
				router.replace(`/${project.id}/threads`);
				router.refresh();
			},
			onError: (e) => {
				toast.error(e.data?.zodError?.formErrors?.[0] ?? e.message);
			},
		});

	if (!isSignedIn) redirect("/sign-in");

	return (
		<Card className="p-6">
			<div className="flex items-center gap-4">
				<Avatar>
					<AvatarImage
						src={author?.imageUrl}
						alt={author?.username ?? "Removed member"}
					/>
					<AvatarFallback>N/A</AvatarFallback>
				</Avatar>
				<div className="max-w-full min-w-0 w-full">
					{editing ? (
						<form className="relative w-full mt-5">
							<Input
								placeholder="Title"
								value={title}
								name="title"
								id="title"
								errorMessage={titleError}
								onChange={(e) => {
									if (e.target.value.length <= maxTitleChar)
										setTitle(e.target.value);
								}}
								className="font-bold text-2xl h-fit"
							/>
							<span className="text-muted-foreground absolute bottom-0 right-0 text-sm">
								{title.length} / {maxTitleChar}
							</span>
						</form>
					) : (
						<CardTitle className="font-bold text-2xl break-words">
							{thread.title}
						</CardTitle>
					)}
				</div>
			</div>
			{thread.content && (
				<div className="my-8">
					<Tiptap
						editable={editing}
						content={thread.content}
						onSubmit={(editor) => {
							setTitleError("");
							if (title.length === 0) {
								setTitleError("Title is required");
								return;
							}
							editThread({
								threadId: thread.id,
								title,
								content:
									editor.getText().length === 0
										? ""
										: editor.getHTML(),
							});
						}}
						onCancel={() => {
							setTitle(thread.title);
							setEditing(false);
						}}
						role={"none"}
						isSubmitting={editThreadLoading}
						className="border-0 p-0"
						submitDisabled={title === thread.title}
					/>
				</div>
			)}
			<div className="flex justify-between items-center max-w-full mt-4 text-muted-foreground flex-wrap">
				<div className="items-center flex flex-grow gap-4">
					<span className="inline-flex items-center gap-2">
						<FaRegUserCircle />
						{author?.username ?? "Removed"}
					</span>
					<span className="inline-flex items-center gap-2 max-w-full min-w-0">
						<FaRegClock className="min-w-[16px] min-h-4" />
						<span className="truncate">
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
					</span>
					<span className="inline-flex items-center gap-2">
						<FaRegComment /> {thread.replies.length}
					</span>
				</div>
				{(thread.author === user.id || user.id === project.leader) && (
					<>
						<div className="items-center gap-4 hidden md:flex">
							{!editing && thread.author === user.id && (
								<Button
									variant="ghost"
									className="h-8 w-20 ml-4"
									onClick={() => {
										setEditing(true);
									}}
								>
									<MdModeEdit className="mr-2" />
									Edit
								</Button>
							)}
							<Dialog
								open={showDeleteConfirm}
								onOpenChange={setShowDeleteConfirm}
							>
								<DialogTrigger asChild>
									<Button
										variant="ghost"
										className="h-8 w-20"
									>
										<span className="mr-2">
											<MdDelete />
										</span>
										Delete
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogTitle>Confirm Delete</DialogTitle>
									Are you sure that you want to delete this
									thread? All replies under this will also be
									deleted.
									<div className="w-full flex gap-2 justify-end items-center">
										<Button
											variant="outline"
											onClick={() =>
												setShowDeleteConfirm(false)
											}
										>
											Cancel
										</Button>
										<Button
											variant="destructive"
											onClick={() =>
												deleteThread(thread.id)
											}
											loading={deleteThreadLoading}
										>
											Delete
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger className="md:hidden" asChild>
								<Button variant="ghost" className="p-0">
									<FaEllipsis />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="p-2">
								{thread.author === user.id && (
									<DropdownMenuItem
										onSelect={() => setEditing(true)}
										disabled={editing}
									>
										Edit
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									onSelect={() => setShowDeleteConfirm(true)}
								>
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				)}
			</div>
		</Card>
	);
}
