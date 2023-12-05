import { type Tasks } from "@prisma/client";
import React from "react";

export default function TaskCard({ task }: { task: Tasks }) {
	return (
		<div className="w-full p-2 mb-2 bg-primary-foreground dark:bg-input rounded-md">
			{task.title}
		</div>
	);
}
