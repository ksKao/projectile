import React from "react";
import CreatePollButton from "./create-poll-button";

export default function PollsPage() {
	return (
		<div className="flex justify-between items-center h-10">
			<h1 className="text-2xl font-bold">Polls</h1>
			<CreatePollButton />
		</div>
	);
}
