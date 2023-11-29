import { currentUser } from "@clerk/nextjs";
import CreateProjectModal from "~/components/create-project-modal";
import { api } from "~/trpc/server";
import Image from "next/image";

export default async function Home() {
	const projects = await api.project.getAllProjects.query();
	const user = await currentUser();

	return (
		<>
			<div className="flex justify-between items-center">
				<h1 className="font-bold text-4xl">My Projects</h1>
				<CreateProjectModal />
			</div>
			{user?.username}
			{projects.length > 0 ? (
				projects.map((p) => (
					<div key={p.id}>
						<Image
							src={p.thumbnailUrl}
							alt={p.name}
							width={40}
							height={40}
						/>
						{p.name}
					</div>
				))
			) : (
				<p>No Projects</p>
			)}
		</>
	);
}
