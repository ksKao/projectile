"use client";
import { Draggable } from "@hello-pangea/dnd";
import { type Tasks } from "@prisma/client";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from "~/components/ui/dialog";
import { BiTask } from "react-icons/bi";
import { useProject } from "~/lib/contexts/projectContext";
import { notFound } from "next/navigation";
import { Avatar } from "~/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceStrict } from "date-fns";
import TaskDueDatePicker from "./task-due-date-picker";
import TaskAssignedMembers from "./task-assigned-members";
import TaskDescription from "./task-description";

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
								<p className="font-semibold truncate">
									{task.title}
								</p>
								{task.dueDate && (
									<p className="text-muted-foreground text-sm">
										Due{" "}
										{formatDistanceStrict(
											task.dueDate,
											new Date(),
											{
												addSuffix: true,
											},
										)}
									</p>
								)}
								{task.assignedMembers.length > 0 && (
									<ul className="flex gap-2 mt-2">
										{task.assignedMembers
											.slice(
												0,
												task.assignedMembers.length > 7
													? 6
													: 7,
											)
											.map((m) => {
												const member =
													project.members.find(
														(member) =>
															member.id === m,
													);
												if (!member) return null;
												return (
													<li key={m}>
														<Avatar className="w-8 h-8">
															<AvatarImage
																src={
																	member.imageUrl
																}
															/>
														</Avatar>
													</li>
												);
											})}
										{task.assignedMembers.length > 7 && (
											<li className="bg-primary w-8 h-8 rounded-full flex items-center justify-center overflow-hidden text-white cursor-pointer">
												+
												{task.assignedMembers.length -
													6}
											</li>
										)}
									</ul>
								)}
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
								<TaskAssignedMembers
									members={task.assignedMembers}
									taskId={task.id}
								/>
								<TaskDueDatePicker
									dueDate={task.dueDate}
									taskId={task.id}
								/>
							</div>
							<TaskDescription
								taskDescription={task.description}
							/>
						</DialogContent>
					</Dialog>
				);
			}}
		</Draggable>
	);
}
