"use client";
import React, { useState } from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { useRouter } from "next-nprogress-bar";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { BiTrash } from "react-icons/bi";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { useProject } from "~/lib/contexts/projectContext";
import LoadingSpinner from "~/components/ui/loading-spinner";

type Poll = inferRouterOutputs<AppRouter>["polls"]["getPolls"][number];

export default function PollCard({ initialPoll }: { initialPoll: Poll }) {
	const router = useRouter();
	const project = useProject();
	const { user } = useUser();
	const [poll, setPoll] = useState(initialPoll);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const { mutate: vote, isLoading: voteLoading } = api.polls.vote.useMutation(
		{
			onSuccess: (data) => {
				if (data) setPoll(data);
			},
			onError: (e) =>
				toast.error(e.data?.zodError?.formErrors?.[0] ?? e.message),
			onSettled: () => router.refresh(),
		},
	);
	const { mutate: deletePoll, isLoading: deletePollLoading } =
		api.polls.deletePoll.useMutation({
			onSuccess: () => {
				setDeleteDialogOpen(false);
				router.refresh();
			},
			onError: (e) =>
				toast.error(e.data?.zodError?.formErrors?.[0] ?? e.message),
		});
	const totalVotes = poll.options.reduce(
		(prev, curr) => prev + curr.votedBy.length,
		0,
	);

	return (
		<div
			className={`p-2 max-w-full w-auto border border-foreground rounded-md ${
				voteLoading || deletePollLoading ? "opacity-50" : ""
			}`}
		>
			<div className="flex justify-between w-full items-center">
				<h2 className="font-bold text-lg">{poll.title}</h2>
				{project.leader === user?.id ? (
					<Dialog
						open={deleteDialogOpen}
						onOpenChange={setDeleteDialogOpen}
					>
						<DialogTrigger asChild>
							<Button
								variant="destructive"
								className="p-2 py-0 h-10 w-10"
								loading={voteLoading}
							>
								<BiTrash className="w-5 h-5" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>Delete Poll</DialogTitle>
							Are you sure you want to delete this poll?
							<div className="flex w-full justify-end gap-2">
								<Button
									variant="outline"
									onClick={() => setDeleteDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									variant="destructive"
									loading={deletePollLoading}
									onClick={() => deletePoll(poll.id)}
								>
									Delete
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				) : (
					<LoadingSpinner
						className={`p-2 ${
							voteLoading ? "opacity-100" : "opacity-0"
						}`}
					/>
				)}
			</div>
			<ul className="flex flex-col gap-2 mt-2">
				{poll.options.map((o) => {
					const votePercentage =
						(o.votedBy.length / totalVotes) * 100;
					return (
						<li
							key={o.id}
							className={`border ${
								o.votedBy.includes(user?.id ?? "")
									? "border-primary"
									: "border-muted-foreground"
							} rounded-md text-foreground truncate min-w-0 relative`}
						>
							<div
								className={`${
									o.votedBy.includes(user?.id ?? "")
										? "bg-primary/20"
										: "bg-gray-200 dark:bg-gray-500"
								} absolute h-full min-h-full -z-10`}
								id={`${o.votedBy.length}%`}
								style={{
									width: `${votePercentage}%`,
								}}
							/>
							<button
								className={`${
									o.votedBy.includes(user?.id ?? "")
										? "text-primary"
										: "text-foreground"
								} w-full text-left p-2 flex items-center justify-between`}
								disabled={
									voteLoading ??
									deletePollLoading ??
									o.votedBy.includes(user?.id ?? "")
								}
								onClick={() => vote(o.id)}
							>
								<span>{o.title}</span>
								{!isNaN(votePercentage) && (
									<span>{Math.round(votePercentage)} %</span>
								)}
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
