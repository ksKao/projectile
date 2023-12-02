import { notFound } from "next/navigation";
import React from "react";
import { api } from "~/trpc/server";

export default async function Project({
	params,
}: {
	params: { projectId: string };
}) {
	const res = await api.project.getProject.query(params.projectId);

	if (!res) notFound();

	return <div>{res.name}</div>;
}
