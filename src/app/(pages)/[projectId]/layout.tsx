import type { Metadata } from "next";
import ProjectNav from "~/components/project-nav";
import { ProjectProvider } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/server";

export default async function PagesLayout({
	params,
	children,
}: {
	params: { projectId: string };
	children: React.ReactNode;
}) {
	const project = await api.project.getProject.query(params.projectId);

	return (
		<ProjectProvider projectId={params.projectId}>
			<div className="relative flex -mx-8 md:-mx-12 lg:-mx-16 h-full flex-col md:flex-row overflow-x-auto">
				<ProjectNav project={project} />
				<div className="px-8 pt-24 pb-4 w-full md:p-8 flex-grow h-full">
					{children}
				</div>
			</div>
		</ProjectProvider>
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
