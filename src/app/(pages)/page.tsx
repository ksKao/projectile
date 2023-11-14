import { currentUser } from "@clerk/nextjs";
import { api } from "~/trpc/server";

export default async function Home() {
	const hello = await api.post.hello.query({ text: "from tRPC" });
	const user = await currentUser();

	return (
		<>
			<h1 className="font-bold text-4xl">My Projects</h1>
			{user?.username}
		</>
	);
}
