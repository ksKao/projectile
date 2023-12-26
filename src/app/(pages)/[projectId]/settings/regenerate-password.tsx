"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaRegClipboard } from "react-icons/fa6";
import { IoMdRefresh } from "react-icons/io";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { useProject } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/react";

export default function RegeneratePasswordForm() {
	const project = useProject();
	const [password, setPassword] = useState(project.password);
	const utils = api.useUtils();
	const { mutate, isLoading } = api.project.regeneratePassword.useMutation({
		onSuccess: async (data) => {
			setPassword(data);
			await utils.project.getProject.invalidate();
		},
		onError: (e) =>
			toast.error(e.data?.zodError?.formErrors?.[0] ?? e.message),
	});
	return (
		<div className="md:max-w-[500px]">
			<Label>Project Password</Label>
			<div className="flex gap-2 justify-between w-full">
				<p className="p-2 border border-muted rounded-md flex-grow">
					{project.password}
				</p>
				<Button
					onClick={() => {
						navigator.clipboard
							.writeText(password)
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
				<Button
					loading={isLoading}
					onClick={() => {
						mutate(project.id);
					}}
				>
					<IoMdRefresh />
				</Button>
			</div>
		</div>
	);
}
