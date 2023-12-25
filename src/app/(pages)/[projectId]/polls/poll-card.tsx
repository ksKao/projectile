"use client";
import React, { useState } from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { useRouter } from "next-nprogress-bar";
import toast from "react-hot-toast";
import LoadingSpinner from "~/components/ui/loading-spinner";

type Poll = inferRouterOutputs<AppRouter>["polls"]["getPolls"][number];

export default function PollCard({ initialPoll }: { initialPoll: Poll }) {
	const router = useRouter();
	const { user } = useUser();
	const [poll, setPoll] = useState(initialPoll);
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
	const totalVotes = poll.options.reduce(
		(prev, curr) => prev + curr.votedBy.length,
		0,
	);

	return (
		<div
			className={`p-2 max-w-full w-auto border border-foreground rounded-md ${
				voteLoading ? "opacity-50" : ""
			}`}
		>
			<div className="flex justify-between w-full">
				<h2 className="font-bold text-lg">{poll.title}</h2>
				{voteLoading && <LoadingSpinner className="h-7" />}
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
										? "bg-primary"
										: "bg-muted"
								} absolute h-full min-h-full -z-10`}
								id={`${o.votedBy.length}%`}
								style={{
									width: `${votePercentage}%`,
								}}
							/>
							<button
								className="w-full text-left p-2 flex items-center justify-between"
								disabled={
									voteLoading ??
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
