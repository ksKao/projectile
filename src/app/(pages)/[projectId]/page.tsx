"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Skeleton } from "~/components/ui/skeleton";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useProject } from "~/lib/contexts/projectContext";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import { FaEllipsisH, FaRegClipboard } from "react-icons/fa";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { IoExit, IoPersonAdd } from "react-icons/io5";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useRouter } from "next-nprogress-bar";
import { Avatar, AvatarImage } from "~/components/ui/avatar";

export default function Project() {
	const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
	const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
	const { user } = useUser();
	const utils = api.useUtils();
	const router = useRouter();
	const removeMutation = api.project.removeMember.useMutation({
		onSuccess: async (removedId) => {
			toast.success(
				removedId === user?.id
					? "You have left the project."
					: "Member has been removed",
			);
			await utils.project.getAllProjects.refetch();
			if (removedId === user?.id) router.push("/");
		},
		onError: (e) =>
			toast.error(
				e.data?.zodError?.fieldErrors.projectId?.[0] ?? e.message,
			),
		onSettled: () => utils.project.getProject.refetch(),
	});
	const reassignMutation = api.project.reassignLeader.useMutation({
		onSuccess: () => toast.success("The leader has been reassigned"),
		onError: (e) =>
			toast.error(
				e.data?.zodError?.fieldErrors.newLeaderId?.[0] ??
					e.data?.zodError?.fieldErrors.projectId?.[0] ??
					e.message,
			),
		onSettled: () => utils.project.getProject.refetch(),
	});
	const project = useProject();

	return (
		<>
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Project Dashboard</h1>
				{project.leader === user?.id && (
					<Dialog>
						<DialogTrigger asChild>
							<Button>
								<IoPersonAdd />
								<span className="ml-2 hidden md:block">
									Invite
								</span>
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Invite a new member</DialogTitle>
							</DialogHeader>
							<p className="text-muted-foreground text-sm text-center md:text-left">
								Send the invite code to a person that you would
								like to invite.
							</p>
							<div>
								<div>
									<Label>Invite Code</Label>
									<div className="w-full flex gap-2">
										<Input
											value={project.password}
											disabled
										/>
										<Button
											onClick={() => {
												navigator.clipboard
													.writeText(project.password)
													.then(() =>
														toast.success(
															"Password has been copied to clipboard",
														),
													)
													.catch(() => {
														toast.error(
															"Something went wrong while copying.",
														);
													});
											}}
										>
											<FaRegClipboard />
										</Button>
									</div>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>
			<div className="flex flex-col md:flex-row mt-4">
				<div className="relative min-w-[9rem] min-h-[9rem] w-36 h-36">
					{!thumbnailLoaded && (
						<Skeleton className="rounded-md min-w-[9rem] min-h-[9rem] absolute -z-10" />
					)}
					<Image
						src={project.thumbnailUrl}
						alt={project.name}
						className="rounded-md object-cover -z-10"
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						onLoad={() => setThumbnailLoaded(true)}
					/>
				</div>
				<div className="flex-grow mt-2 md:mt-0 md:ml-4 min-h-full flex flex-col">
					<div>
						<h2 className="font-semibold text-lg">
							{project.name}
						</h2>
						<p className="font-light text-gray-700 dark:text-gray-400 overflow-ellipsis whitespace-nowrap overflow-hidden">
							Due {format(project.dueDate, "eee, do MMM yy")}
						</p>
					</div>
					<p className="flex-grow mt-2 italic font-thin">
						{project.description
							? project.description
							: "This project currently has no description"}
					</p>
				</div>
			</div>
			<div className="flex justify-between items-center mt-8">
				<h2 className="text-2xl font-bold">Members</h2>
				<Dialog
					open={leaveDialogOpen}
					onOpenChange={setLeaveDialogOpen}
				>
					<DialogTrigger asChild>
						<Button variant="destructive">
							<IoExit />
							<span className="ml-2 hidden md:block">
								Leave Project
							</span>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Leave Project?</DialogTitle>
						</DialogHeader>
						Are you sure you want to leave this project? You will
						not be able to join back unless you have the invite
						code.
						<div className="w-full flex justify-end items-center gap-2">
							<Button
								variant="outline"
								onClick={() => setLeaveDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								loading={removeMutation.isLoading}
								onClick={() => {
									removeMutation.mutate({
										projectId: project.id,
										removeMemberId: user?.id ?? "",
									});
								}}
							>
								Leave
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>
			<ul className="py-4">
				{project.members
					.sort(
						(a, b) =>
							a.username?.localeCompare(b.username ?? "") ?? 1,
					)
					.map((m) => (
						<li key={m.id} className="flex mb-4 justify-between">
							<div className="flex gap-4 items-center flex-grow min-w-0">
								<Avatar>
									<AvatarImage
										src={m.imageUrl}
										alt={m.username ?? m.id}
										width={40}
										height={40}
									/>
								</Avatar>
								<p className="truncate">
									{m.username}{" "}
									{project.leader === m.id && (
										<span className="font-light">
											(Leader)
										</span>
									)}
								</p>
							</div>
							{project.leader === user?.id &&
								m.id !== user.id && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												loading={
													reassignMutation.isLoading ||
													removeMutation.isLoading
												}
											>
												<FaEllipsisH />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												disabled={
													reassignMutation.isLoading ||
													removeMutation.isLoading
												}
												onSelect={() => {
													reassignMutation.mutate({
														projectId: project.id,
														newLeaderId: m.id,
													});
												}}
											>
												Make Leader
											</DropdownMenuItem>
											<DropdownMenuItem
												disabled={
													reassignMutation.isLoading ||
													removeMutation.isLoading
												}
												onSelect={() => {
													removeMutation.mutate({
														projectId: project.id,
														removeMemberId: m.id,
													});
												}}
											>
												Remove Member
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
						</li>
					))}
			</ul>
		</>
	);
}
