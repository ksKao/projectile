"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { notFound } from "next/navigation";
import { createContext, useContext } from "react";
import LoadingSpinner from "~/components/ui/loading-spinner";
import type { AppRouter } from "~/server/api/root";
import { api } from "~/trpc/react";

type ProjectWithMember = inferRouterOutputs<AppRouter>["project"]["getProject"];

const ProjectContext = createContext<ProjectWithMember>(null);

export function useProject() {
	return useContext(ProjectContext);
}

export function ProjectProvider({
	projectId,
	children,
}: {
	projectId: string;
	children: React.ReactNode;
}) {
	const { data, isLoading } = api.project.getProject.useQuery(projectId);

	if (isLoading)
		return (
			<div className="w-full h-full flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	if (!data) notFound();

	return (
		<ProjectContext.Provider value={data}>
			{children}
		</ProjectContext.Provider>
	);
}
