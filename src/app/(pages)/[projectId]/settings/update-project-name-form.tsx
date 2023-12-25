"use client";
import { useRouter } from "next-nprogress-bar";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoIosSave } from "react-icons/io";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useProject } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/react";

export default function UpdateProjectNameForm() {
	const project = useProject();
	const utils = api.useUtils();
	const router = useRouter();
	const [projectName, setProjectName] = useState(project.name);
	const [nameError, setNameError] = useState("");
	const { mutate, isLoading } = api.project.updateProject.useMutation({
		onSuccess: async () => {
			await utils.project.getProject.invalidate();
			router.refresh(); // needed to update the page title
			toast.success("Project name has been updated");
		},
		onError: (e) => {
			const error = e.data?.zodError?.fieldErrors;
			if (error?.name?.[0]) {
				setNameError(error.name[0]);
				return;
			}
			toast.error(error?.id?.[0] ?? e.message);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				setNameError("");
				if (projectName.length === 0) {
					setNameError("Project name is required");
					return;
				} else if (projectName.length > 255) {
					setNameError(
						"Project name cannot be longer than 255 characters",
					);
					return;
				}
				mutate({
					id: project.id,
					name: projectName,
				});
			}}
		>
			<Label htmlFor="projectName">Project Name</Label>
			<div className="flex gap-2 md:max-w-[500px]">
				<Input
					placeholder="Project Name"
					value={projectName}
					errorMessage={nameError}
					onChange={(e) => setProjectName(e.target.value)}
					id="projectName"
					name="projectName"
				/>
				<Button
					disabled={
						projectName === project.name || projectName.length === 0
					}
					loading={isLoading}
				>
					<IoIosSave />
				</Button>
			</div>
		</form>
	);
}
