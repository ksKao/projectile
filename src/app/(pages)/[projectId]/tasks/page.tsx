import React from "react";
import TaskColumn from "~/components/task-column";

export default function TasksPage() {
	return (
		<div className="max-h-full h-full">
			<h1 className="text-2xl font-bold">Task Board</h1>
			<div className="pt-4 max-h-[calc(100%-2rem)] h-full">
				<TaskColumn />
			</div>
		</div>
	);
}
