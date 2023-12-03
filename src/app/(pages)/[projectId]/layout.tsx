import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectNav from "~/components/project-nav";
import { api } from "~/trpc/server";

export default async function PagesLayout({
	params,
	children,
}: {
	params: { projectId: string };
	children: React.ReactNode;
}) {
	const project = await api.project.getProject.query(params.projectId);

	if (!project) notFound();

	return (
		<div className="md:flex -mx-8 md:-mx-12 lg:-mx-16 h-full">
			<ProjectNav project={project} />
			<div className="px-8 pt-8 pb-4 w-full md:p-8">{children}</div>
		</div>
	);
}

export async function generateMetadata({
	params,
}: {
	params: {
		projectId: string;
	};
}): Promise<Metadata> {
	const project = await api.project.getProject.query(params.projectId);

	return {
		title: project?.name,
	};
}
