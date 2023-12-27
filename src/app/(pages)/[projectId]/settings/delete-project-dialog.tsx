"use client";
import { useRouter } from "next-nprogress-bar";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { useProject } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/react";

export default function DeleteProjectDialog() {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const utils = api.useUtils();
	const project = useProject();
	const { mutate, isLoading } = api.project.deleteProject.useMutation({
		onSuccess: async () => {
			toast.success("Project has been deleted");
			router.replace("/");
			router.refresh();
			await utils.project.getAllProjects.refetch();
		},
		onError: (e) =>
			toast.error(e.data?.zodError?.formErrors?.[0] ?? e.message),
	});
	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(o) => {
					if (!isLoading) setOpen(o);
				}}
			>
				<DialogTrigger asChild>
					<Button variant="destructive">Delete Project</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogTitle>Confirm Delete</DialogTitle>
					Are you sure you want to delete this project? All data will
					be lost.
					<div className="w-full flex gap-2 justify-end">
						<Button
							variant="outline"
							onClick={() => {
								if (!isLoading) setOpen(false);
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							loading={isLoading}
							onClick={() => {
								mutate(project.id);
							}}
						>
							Confirm
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
