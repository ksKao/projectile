import { currentUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";

export default async function Home() {
	const hello = await api.post.hello.query({ text: "from tRPC" });
	const user = await currentUser();

	return (
		<>
			<div className="flex justify-between items-center">
				<h1 className="font-bold text-4xl">My Projects</h1>
				<Button className="font-semibold">Create Project</Button>
			</div>
			{user?.username}
		</>
	);
}
