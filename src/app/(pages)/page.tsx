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
						<div className="relative w-24 h-24">
							<Image
								src={p.thumbnailUrl}
								alt={p.name}
								className="rounded-md"
								fill
								objectFit="cover"
							/>
						</div>
						{p.name}
						<div className="flex gap-2">
							{p.members.map(
								(member) =>
									member && (
										<div key={member.userId}>
											<Image
												src={member.imageUrl}
												alt={member.userId}
												width={40}
												height={40}
												className="rounded-full"
											/>
										</div>
									),
							)}
						</div>
					</div>
				))
			) : (
				<p>No Projects</p>
			)}
		</>
	);
}
