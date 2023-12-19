import React from "react";
import CreatePollButton from "./create-poll-button";
import { api } from "~/trpc/server";

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
			{polls.map((p) => (
				<div key={p.id}>
					<h2 className="font-bold text-lg">{p.title}</h2>
					<ul>
						{p.options.map((o) => (
							<li key={o.id}>{o.title}</li>
						))}
					</ul>
				</div>
			))}
		</>
	);
}
