"use client";
import React from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { useUser } from "@clerk/nextjs";

type Poll = inferRouterOutputs<AppRouter>["polls"]["getPolls"][number];

export default function PollCard({ poll }: { poll: Poll }) {
	const totalVotes = poll.options.reduce(
		(prev, curr) => prev + curr.votedBy.length,
		0,
	);
	const { user } = useUser();

	return (
		<div className="p-2 max-w-full w-auto border border-foreground rounded-md">
			<h2 className="font-bold text-lg">{poll.title}</h2>
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
								disabled={o.votedBy.includes(user?.id ?? "")}
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
