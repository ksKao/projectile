"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoIosSave } from "react-icons/io";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useProject } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/react";

export default function UpdateProjectDescriptionForm() {
	const project = useProject();
	const utils = api.useUtils();
	const [projectDescription, setProjectDescription] = useState(
		project.description,
	);
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
					description: projectDescription,
				});
			}}
		>
			<Label htmlFor="projectDescription">Project Name</Label>
			<div className="w-full md:max-w-[500px]">
				<Textarea
					placeholder="Project Description"
					value={projectDescription}
					onChange={(e) => setProjectDescription(e.target.value)}
					id="projectDescription"
					name="projectDescription"
					className="w-full md:w-[500px]"
				/>
				<div className="w-full flex justify-end -mt-2">
					<Button
						disabled={projectDescription === project.description}
						loading={isLoading}
						className="w-full"
					>
						<IoIosSave />
					</Button>
				</div>
			</div>
		</form>
	);
}
