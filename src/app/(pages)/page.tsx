import { currentUser } from "@clerk/nextjs";
import CreateProjectModal from "~/components/create-project-modal";

export default async function Home() {
	//const hello = await api.post.hello.query({ text: "from tRPC" });
	const user = await currentUser();

	return (
		<>
			<div className="flex justify-between items-center">
				<h1 className="font-bold text-4xl">My Projects</h1>
				<CreateProjectModal />
			</div>
			{user?.username}
		</>
	);
}
