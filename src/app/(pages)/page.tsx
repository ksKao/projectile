import { currentUser } from "@clerk/nextjs";
import CreateProjectModal from "./create-project-modal";
import { api } from "~/trpc/server";
import ProjectCard from "./project-card";
import Link from "next/link";

export default async function Home() {
	const projects = await api.project.getAllProjects.query();
	const user = await currentUser();

	return (
		<>
			<div className="flex justify-between items-center">
				<h1 className="font-bold text-3xl">My Projects</h1>
				<CreateProjectModal />
			</div>
			{user?.emailAddresses[0]?.emailAddress}
			<div className="flex flex-col md:flex-row md:flex-wrap gap-4">
				{projects.length > 0 ? (
					projects.map((p) => (
						<Link href={`/${p.id}`} key={p.id}>
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
					))
				) : (
					<p>No Projects</p>
				)}
			</div>
		</>
	);
}
