import React from "react";
import TaskColumn from "~/components/task-column";
import { Button } from "~/components/ui/button";

export default function TasksPage() {
	return (
		<div className="max-h-full h-full">
			<h1 className="text-2xl font-bold">Task Board</h1>
			<div className="pt-4 max-h-[calc(100%-2rem)] h-full flex gap-x-3">
				<TaskColumn />
				<TaskColumn />
				<TaskColumn />
				<TaskColumn />
				<TaskColumn />
				<TaskColumn />
				<TaskColumn />
				<Button className="bg-input dark:bg-primary-foreground min-w-[16rem] p-2 border dark:border-0 rounded-md text-foreground">
					Add a Column
				</Button>
			</div>
		</div>
	);
}
