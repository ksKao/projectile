"use client";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { IoCalendarClear } from "react-icons/io5";
import { format } from "date-fns";

export default function CreateProjectModal() {
	const [date, setDate] = useState(new Date());
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="font-semibold">Create Project</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[80vw] w-96">
				<DialogHeader>
					<DialogTitle>Create Project</DialogTitle>
				</DialogHeader>
				<form>
					<Input
						type="text"
						id="name"
						name="text"
						label="Project Name"
						placeholder="Project Name"
					/>
					<Textarea
						id="description"
						name="description"
						className="resize-none"
						placeholder="Project Description"
						label="Project Description"
					/>
					<Input
						id="thumbnail"
						name="thumbnail"
						type="file"
						accept="image/*"
						label="Project Thumbnail"
					/>
					<Label className="font-medium text-sm mb-[6px]">
						Project Due Date
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="w-full text-left font-normal flex justify-between"
							>
								<span>{format(date, "PPP")}</span>
								<IoCalendarClear />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={date}
								onSelect={(d) => setDate(d ?? new Date())}
							/>
						</PopoverContent>
					</Popover>
					<Button className="mt-6 w-full">Create Project</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
