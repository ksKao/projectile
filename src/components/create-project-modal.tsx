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
import { api } from "~/trpc/react";
import { createProjectSchema } from "~/lib/schema";
import toast from "react-hot-toast";
import { supabaseClient } from "~/lib/supabaseClient";
import { useRouter } from "next/navigation";

type ProjectInfo = {
	name: string;
	description: string;
	image: File | null;
	dueDate: Date;
};

const emptyError = {
	name: "",
	description: "",
	image: "",
	dueDate: "",
};

export default function CreateProjectModal() {
	const router = useRouter();
	const createMutation = api.project.createProject.useMutation({
		onError: (e) => {
			if (e.data?.zodError) {
				const errors = e.data.zodError.fieldErrors;

				setError({
					name: errors?.name?.[0] ?? "",
					description: errors?.description?.[0] ?? "",
					dueDate: errors?.dueDate?.[0] ?? "",
					image: errors?.image?.[0] ?? "",
				});
			} else {
				toast.error(e.message);
			}
		},
		onSuccess: async (data) => {
			if (!projectInfo.image) return;
			const res = await supabaseClient.storage
				.from("projects")
				.uploadToSignedUrl(data.path, data.token, projectInfo.image, {
					upsert: true,
				});
			if (res.error) {
				// if image failed to upload, delete the record in db
				deleteMutation.mutate(data.projectId);
				toast.error(res.error.message);
			} else {
				toast.success("Your project has been successfully created.");
				router.refresh();
			}
		},
	});
	const deleteMutation = api.project.deleteProject.useMutation();
	const [error, setError] = useState(emptyError);
	const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
		name: "",
		description: "",
		image: null,
		dueDate: new Date(),
	});
	const [calendarOpen, setCalendarOpen] = useState(false);

	const createProject: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		setError(emptyError);

		const res = createProjectSchema.safeParse({
			...projectInfo,
			image: projectInfo.image?.name ?? "",
		});

		if (!res.success) {
			const errors = res.error.flatten().fieldErrors;
			setError({
				name: errors.name?.[0] ?? "",
				description: errors.description?.[0] ?? "",
				dueDate: errors.dueDate?.[0] ?? "",
				image: errors.image?.[0] ?? "",
			});
			return;
		}

		createMutation.mutate({
			...projectInfo,
			image: projectInfo.image?.name ?? "",
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="font-semibold">Create Project</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[80vw] w-96">
				<DialogHeader>
					<DialogTitle>Create Project</DialogTitle>
				</DialogHeader>
				<form onSubmit={createProject}>
					<Input
						type="text"
						id="name"
						name="text"
						label="Project Name"
						placeholder="Project Name"
						value={projectInfo.name}
						onChange={(e) =>
							setProjectInfo({
								...projectInfo,
								name: e.target.value,
							})
						}
						errorMessage={error.name}
					/>
					<Textarea
						id="description"
						name="description"
						className="resize-none"
						placeholder="Project Description"
						label="Project Description"
						value={projectInfo.description}
						onChange={(e) =>
							setProjectInfo({
								...projectInfo,
								description: e.target.value,
							})
						}
						errorMessage={error.description}
					/>
					<Input
						id="thumbnail"
						name="thumbnail"
						type="file"
						accept="image/png image/jpeg"
						label="Project Thumbnail"
						onChange={(e) => {
							setProjectInfo({
								...projectInfo,
								image: e.currentTarget.files?.[0] ?? null,
							});
						}}
						errorMessage={error.image}
					/>
					<Label className="font-medium text-sm mb-[6px]">
						Project Due Date
					</Label>
					<Popover
						modal
						open={calendarOpen}
						onOpenChange={(isOpen) => setCalendarOpen(isOpen)}
					>
						<PopoverTrigger asChild>
							<div>
								<Button
									variant="outline"
									className={`w-full text-left font-normal flex justify-between ${
										error.dueDate
											? "border-red-500 border"
											: ""
									}`}
									type="button"
								>
									<span>
										{format(projectInfo.dueDate, "PPP")}
									</span>
									<IoCalendarClear />
								</Button>
								{error.dueDate ? (
									<span className="text-sm text-red-500">
										{error.dueDate}
									</span>
								) : (
									<div className="h-5" />
								)}
							</div>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={projectInfo.dueDate}
								onSelect={(d) => {
									setProjectInfo({
										...projectInfo,
										dueDate: d ?? new Date(),
									});
									setCalendarOpen(false);
								}}
							/>
						</PopoverContent>
					</Popover>
					<Button
						className="mt-6 w-full"
						loading={createMutation.isLoading}
					>
						Create Project
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
