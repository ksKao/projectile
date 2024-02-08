import CreateProjectModal from "./create-project-modal";
import { api } from "~/trpc/server";
import ProjectCard from "./project-card";
import Link from "next/link";
import JoinProjectModal from "./join-project-modal";
import { currentUser } from "@clerk/nextjs";

export default async function Home() {
	const user = await currentUser();
	if (!user) return <></>;
	const projects = await api.project.getAllProjects.query();

	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-between items-center">
				<h1 className="font-bold text-3xl">My Projects</h1>
				<div className="flex gap-2">
					<JoinProjectModal />
					<CreateProjectModal />
				</div>
			</div>
			{projects.length > 0 ? (
				<div className="grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] gap-4 max-w-full mt-4 pb-2">
					{projects.map((p) => (
						<Link href={`/${p.id}`} key={p.id} className="w-full">
							<ProjectCard
								project={{
									id: p.id,
									name: p.name,
									dueDate: p.dueDate,
									thumbnailUrl: p.thumbnailUrl,
									members: p.members,
								}}
							/>
						</Link>
					))}
				</div>
			) : (
				<div className="flex flex-grow justify-center items-center">
					<h2 className="text-lg font-bold text-center">
						You currently do not have any projects. Join one to get
						started.
					</h2>
				</div>
			)}
		</div>
	);
}
