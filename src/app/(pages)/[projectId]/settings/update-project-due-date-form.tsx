"use client";
import { format } from "date-fns";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoIosSave } from "react-icons/io";
import { IoCalendarClear } from "react-icons/io5";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Label } from "~/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { useProject } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/react";

export default function UpdateProjectDueDateForm() {
	const project = useProject();
	const utils = api.useUtils();
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [projectDueDate, setProjectDueDate] = useState(project.dueDate);
	const { mutate, isLoading } = api.project.updateProject.useMutation({
		onSuccess: async () => {
			await utils.project.getProject.invalidate();
			toast.success("Project description has been updated");
		},
		onError: (e) =>
			toast.error(e.data?.zodError?.fieldErrors.id?.[0] ?? e.message),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				mutate({
					id: project.id,
					dueDate: projectDueDate,
				});
			}}
			className="md:max-w-[500px]"
		>
			<Label className="font-medium text-sm mb-[6px]">
				Project Due Date
			</Label>
			<div className="flex justify-end gap-2">
				<Popover
					modal
					open={calendarOpen}
					onOpenChange={setCalendarOpen}
				>
					<PopoverTrigger asChild>
						<div className="w-full">
							<Button
								variant="outline"
								className="w-full text-left font-normal flex justify-between"
								type="button"
							>
								<span>{format(projectDueDate, "PPP")}</span>
								<IoCalendarClear />
							</Button>
						</div>
					</PopoverTrigger>
					<PopoverContent className="w-full p-0">
						<Calendar
							mode="single"
							selected={projectDueDate}
							onSelect={(d) => {
								setProjectDueDate(d ?? new Date());
								setCalendarOpen(false);
							}}
						/>
					</PopoverContent>
				</Popover>
				<Button
					disabled={
						projectDueDate.getTime() === project.dueDate.getTime()
					}
					loading={isLoading}
					className="ml-auto"
				>
					<IoIosSave />
				</Button>
			</div>
		</form>
	);
}
