"use client";

import { Draggable } from "@hello-pangea/dnd";
import { type Tasks } from "@prisma/client";
import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from "~/components/ui/dialog";
import { BiTask } from "react-icons/bi";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useProject } from "~/lib/contexts/projectContext";
import { FaUserPlus } from "react-icons/fa6";
import { notFound } from "next/navigation";
import { Avatar } from "~/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "~/components/ui/calendar";
import { Button } from "~/components/ui/button";
import { IoCalendarClear } from "react-icons/io5";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { IoClose } from "react-icons/io5";

function AssignedMembers({
	members,
	taskId,
}: {
	members: string[];
	taskId: string;
}) {
	const project = useProject();
	const utils = api.useUtils();
	const { isLoading, mutate } =
		api.kanban.modifyTaskAssignedMember.useMutation({
			onSuccess: (message) => toast.success(message),
			onError: (e) => toast.error(e.message),
			onSettled: () => utils.kanban.getColumns.invalidate(),
		});

	if (!project) notFound();

	const notAssignedMembers = project.members.filter(
		(projectMember) =>
			members.find(
				(taskMemberId) => taskMemberId === projectMember.id,
			) === undefined,
	);

	return (
		<div>
			<p className="text-muted-foreground">Assigned members</p>
			<ul className="mt-2 flex gap-2 w-64">
				{members.slice(0, members.length > 5 ? 4 : 5).map((m) => {
					const member = project.members.find(
						(member) => member.id === m,
					);
					if (!member) return null;
					return (
						<li key={m}>
							<Avatar
								className="w-9 h-9"
								role="button"
								onClick={() =>
									mutate({
										userId: m,
										taskId,
										action: "remove",
									})
								}
							>
								<AvatarImage src={member.imageUrl} />
							</Avatar>
						</li>
					);
				})}
				{members.length > 5 && (
					<Popover>
						<PopoverTrigger asChild>
							<li className="bg-primary w-9 h-9 rounded-full flex items-center justify-center overflow-hidden text-white cursor-pointer">
								+{members.length - 4}
							</li>
						</PopoverTrigger>
						<PopoverContent className="flex gap-2 w-fit p-2">
							{members.slice(4, members.length).map((m) => {
								const member = project.members.find(
									(member) => member.id === m,
								);
								if (!member) return null;
								return (
									<Avatar
										key={m}
										className="w-9 h-9"
										role="button"
										onClick={() =>
											mutate({
												userId: m,
												taskId,
												action: "remove",
											})
										}
									>
										<AvatarImage src={member.imageUrl} />
									</Avatar>
								);
							})}
						</PopoverContent>
					</Popover>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild disabled={isLoading}>
						{notAssignedMembers.length > 0 && (
							<button className="w-9 h-9 rounded-full text-secondary-foreground bg-secondary flex justify-center items-center">
								{isLoading ? (
									<LoadingSpinner className="w-6 h-6" />
								) : (
									<FaUserPlus className="w-5 h-5" />
								)}
							</button>
						)}
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						{notAssignedMembers.map((remainingMember) => (
							<DropdownMenuItem
								key={remainingMember.id}
								textValue={remainingMember.id}
								onSelect={() => {
									mutate({
										userId: remainingMember.id,
										taskId,
										action: "add",
									});
								}}
								disabled={isLoading}
								className="flex items-center gap-2"
							>
								<Avatar className="w-5 h-5">
									<AvatarImage
										src={remainingMember.imageUrl}
									/>
								</Avatar>
								<p className="text-base">
									{remainingMember.username}
								</p>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</ul>
		</div>
	);
}

function ProjectDueDate({
	dueDate: defaultDueDate,
	taskId,
}: {
	dueDate: Date | null;
	taskId: string;
}) {
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [dueDate, setDueDate] = useState(defaultDueDate);
	const utils = api.useUtils();
	const { isLoading, mutate } = api.kanban.modifyTaskDueDate.useMutation({
		onSuccess: () => toast.success("Due date modified successfully"),
		onError: (e) =>
			toast.error(
				e.data?.zodError?.fieldErrors?.dueDate?.[0] ??
					e.data?.zodError?.fieldErrors?.taskId?.[0] ??
					e.message,
			),
		onSettled: () => utils.kanban.getColumns.invalidate(),
	});

	return (
		<div>
			<p className="text-muted-foreground">Task Due Date</p>
			<div className="flex items-end gap-2">
				<Popover
					modal
					open={calendarOpen}
					onOpenChange={(isOpen) => setCalendarOpen(isOpen)}
				>
					<PopoverTrigger asChild disabled={isLoading}>
						<Button
							variant="outline"
							className="w-56 text-left font-normal flex justify-between mt-2 gap-4"
							type="button"
						>
							<span className="text-muted-foreground">
								{dueDate
									? format(dueDate, "PPP")
									: "No due date"}
							</span>
							{isLoading ? (
								<LoadingSpinner className="w-4 h-4" />
							) : (
								<IoCalendarClear />
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							selected={dueDate ?? undefined}
							onSelect={(d) => {
								setDueDate(d ?? null);
								mutate({
									dueDate: d ?? null,
									taskId,
								});
								setCalendarOpen(false);
							}}
						/>
					</PopoverContent>
				</Popover>
				<Button
					variant="outline"
					onClick={() => {
						if (dueDate !== null) {
							setDueDate(null);
							mutate({
								taskId,
								dueDate: null,
							});
						}
					}}
					className={isLoading ? "opacity-0" : ""}
				>
					<IoClose />
				</Button>
			</div>
		</div>
	);
}

export default function TaskCard({
	task,
	index,
}: {
	task: Tasks;
	index: number;
}) {
	const project = useProject();

	if (!project) notFound();

	return (
		<Draggable draggableId={task.id} index={index}>
			{(provided) => {
				return (
					<Dialog>
						<DialogTrigger asChild>
							<div
								{...provided.draggableProps}
								{...provided.dragHandleProps}
								ref={provided.innerRef}
								className="w-full p-2 mb-2 bg-primary-foreground dark:bg-input rounded-md border-2 border-primary-foreground dark:border-input hover:border-primary dark:hover:border-primary"
								role="button"
							>
								{task.title}
							</div>
						</DialogTrigger>
						<DialogContent className="max-w-[90vw] rounded-md md:w-fit">
							<DialogHeader className="flex flex-row items-center space-y-0 my-2 gap-4 min-w-0">
								<span>
									<BiTask className="w-7 h-7" />
								</span>
								<h2 className="text-xl font-bold truncate">
									{task.title}
								</h2>
							</DialogHeader>
							<div className="flex items-top gap-4 flex-col md:flex-row md:gap-8">
								<AssignedMembers
									members={task.assignedMembers}
									taskId={task.id}
								/>
								<ProjectDueDate
									dueDate={task.dueDate}
									taskId={task.id}
								/>
							</div>
						</DialogContent>
					</Dialog>
				);
			}}
		</Draggable>
	);
}
