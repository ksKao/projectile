import React from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type Props = inferRouterOutputs<AppRouter>["kanban"]["getColumns"][number];

export default function TaskColumn({ column }: { column: Props }) {
	return (
		<div className="min-w-[16rem] h-fit max-h-full bg-input dark:bg-primary-foreground w-64 p-2 border dark:border-0 rounded-md overflow-y-auto">
			<h2 className="font-bold p-1 whitespace-nowrap max-w-full overflow-ellipsis overflow-hidden">
				{column.name}
			</h2>
			<div className="w-full h-32 mt-2 bg-primary-foreground dark:bg-input"></div>
			<div className="w-full h-32 mt-2 bg-primary-foreground dark:bg-input"></div>
			<div className="w-full h-32 mt-2 bg-primary-foreground dark:bg-input"></div>
			<div className="w-full h-32 mt-2 bg-primary-foreground dark:bg-input"></div>
			<div className="w-full h-32 mt-2 bg-primary-foreground dark:bg-input"></div>
			<div className="w-full h-32 mt-2 bg-primary-foreground dark:bg-input"></div>
			<div className="w-full h-32 mt-2 bg-primary-foreground dark:bg-input"></div>
		</div>
	);
}
