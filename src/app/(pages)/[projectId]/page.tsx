import React from "react";
import { api } from "~/trpc/server";

export default async function Project({
	params,
}: {
	params: {
		projectId: string;
	};
}) {
	const project = await api.project.getProject.query(params.projectId);

	return <div>{project?.name}</div>;
}
