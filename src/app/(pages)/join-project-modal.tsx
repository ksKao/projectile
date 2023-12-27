"use client";
import { useRouter } from "next-nprogress-bar";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoMdPersonAdd } from "react-icons/io";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

export default function JoinProjectModal() {
	const [inviteCode, setInviteCode] = useState("");
	const router = useRouter();
	const utils = api.useUtils();
	const { mutate, isLoading } = api.project.joinProject.useMutation({
		onSuccess: async (projectId) => {
			toast.success("You have joined a new project");
			await utils.project.getAllProjects.refetch();
			await utils.project.getProject.refetch();
			router.refresh();
			router.push("/" + projectId);
		},
		onError: (e) =>
			toast.error(e.data?.zodError?.formErrors?.[0] ?? e.message),
	});

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<IoMdPersonAdd />
					<span className="ml-2 hidden md:block">Join Project</span>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Join Project</DialogTitle>
				</DialogHeader>
				<form
					className="mt-2"
					onSubmit={(e) => {
						e.preventDefault();
						if (!inviteCode) return;
						mutate(inviteCode);
					}}
				>
					<Input
						label="Invite Code"
						id="inviteCode"
						name="inviteCode"
						placeholder="Invite Code"
						value={inviteCode}
						onChange={(e) => {
							setInviteCode(e.target.value);
						}}
					/>
					<div className="w-full flex justify-end">
						<Button loading={isLoading}>Join</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
