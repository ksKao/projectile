import type { Metadata } from "next";
import ProjectNav from "./project-nav";
import { ProjectProvider } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/server";

export default function PagesLayout({
	params,
	children,
}: {
	params: { projectId: string };
	children: React.ReactNode;
}) {
	return (
		<ProjectProvider projectId={params.projectId}>
			<div className="flex -mx-8 md:-mx-12 h-full flex-col md:flex-row overflow-x-auto">
				<ProjectNav />
				<div className="px-8 py-4 w-full md:p-8 md:pr-12 flex-grow h-[calc(100%-8svh)] md:h-full md:overflow-y-auto">
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
