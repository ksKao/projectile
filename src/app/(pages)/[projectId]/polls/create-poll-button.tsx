"use client";
import { useRouter } from "next-nprogress-bar";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useProject } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/react";

type PollOption = {
	id: string;
	title: string;
};

export default function CreatePollButton() {
	const maxTitleChar = 100;
	const [open, setOpen] = useState(false);
	const [pollTitle, setPollTitle] = useState("");
	const [pollTitleError, setPollTitleError] = useState("");
	const [pollOptions, setPollOptions] = useState<PollOption[]>([
		{
			id: crypto.randomUUID(),
			title: "",
		},
		{
			id: crypto.randomUUID(),
			title: "",
		},
	]);
	const { isLoading, mutate } = api.polls.createPoll.useMutation({
		onSuccess: () => {
			toast.success("A new poll has been created");
			setOpen(false);
			setPollTitle("");
			setPollOptions([
				{
					id: crypto.randomUUID(),
					title: "",
				},
				{
					id: crypto.randomUUID(),
					title: "",
				},
			]);
			router.refresh();
		},
		onError: (e) => toast.error(e.message),
	});
	const project = useProject();
	const router = useRouter();

	const createPoll: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		setPollTitleError("");
		// if is loading or there is an empty option, dont submit
		if (
			isLoading ||
			pollOptions.find((p) => p.title.length === 0) !== undefined
		)
			return;

		if (pollTitle.length === 0) {
			setPollTitleError("Poll title is required");
			return;
		}

		mutate({
			projectId: project.id,
			title: pollTitle,
			options: pollOptions.map((o) => o.title),
		});
	};

	return (
		<Dialog open={open} onOpenChange={(o) => setOpen(o)}>
			<DialogTrigger asChild>
				<Button>Create Poll</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Poll</DialogTitle>
				</DialogHeader>
				<form onSubmit={createPoll}>
					<label htmlFor="pollTitle">
						<h2 className="text-xl font-semibold mt-4 mb-2">
							Poll Title
						</h2>
					</label>
					<div className="relative">
						<Input
							placeholder="Poll Title"
							value={pollTitle}
							name="pollTitle"
							id="pollTitle"
							errorMessage={pollTitleError}
							onChange={(e) => {
								if (e.target.value.length <= maxTitleChar)
									setPollTitle(e.target.value);
							}}
						/>
						<span className="text-muted-foreground absolute bottom-0 right-0 text-sm">
							{pollTitle.length} / {maxTitleChar}
						</span>
					</div>
					<h2 className="text-xl font-semibold mt-4 mb-2">Options</h2>
					<div className="flex flex-col gap-3">
						{pollOptions.map((option) => (
							<div
								key={option.id}
								className="flex items-start gap-2 relative"
							>
								<Button
									onClick={() => {
										setPollOptions((prev) =>
											prev.filter(
												(o) => o.id !== option.id,
											),
										);
									}}
									type="button"
									disabled={pollOptions.length <= 2}
								>
									<IoMdClose />
								</Button>
								<Input
									value={option.title}
									onChange={(e) => {
										if (e.target.value.length > 50) return;
										const newPollOptions = [...pollOptions];
										const optionIndex =
											pollOptions.findIndex(
												(o) => o.id === option.id,
											);
										if (optionIndex === -1) return;

										newPollOptions[optionIndex] = {
											id:
												newPollOptions[optionIndex]
													?.id ?? crypto.randomUUID(),
											title: e.target.value,
										};
										setPollOptions(newPollOptions);
									}}
									placeholder="Option Title"
								/>
								<span className="text-muted-foreground absolute bottom-0 right-0 text-sm">
									{option.title.length} / {50}
								</span>
							</div>
						))}
					</div>
					{pollOptions.length < 5 && (
						<Button
							variant="outline"
							onClick={() => {
								setPollOptions((prev) => [
									...prev,
									{
										id: crypto.randomUUID(),
										title: "",
									},
								]);
							}}
							type="button"
						>
							Add Another Option
						</Button>
					)}
					<div className="w-full flex justify-end">
						<Button
							loading={isLoading}
							onClick={() => {
								setPollTitleError("");
								if (pollTitle.length === 0) {
									setPollTitleError(
										"Poll title cannot be empty",
									);
									return;
								} else if (pollTitle.length > 100) {
									setPollTitleError(
										"Poll title cannot be longer than 100 characters",
									);
									return;
								}
							}}
							disabled={
								pollOptions.find(
									(p) => p.title.length === 0,
								) !== undefined
							}
						>
							Add Poll
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
