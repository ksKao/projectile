import React from "react";
import CreatePollButton from "./create-poll-button";
import { api } from "~/trpc/server";
import PollCard from "./poll-card";

export default async function PollsPage({
	params,
}: {
	params: {
		projectId: string;
	};
}) {
	const polls = await api.polls.getPolls.query(params.projectId);

	return (
		<>
			<div className="flex justify-between items-center h-10">
				<h1 className="text-2xl font-bold">Polls</h1>
				<CreatePollButton />
			</div>
			<div className="w-full grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] gap-4 max-w-full mt-4 pb-2">
				{polls.map((p) => (
					<PollCard key={p.id} initialPoll={p} />
				))}
			</div>
		</>
	);
}
