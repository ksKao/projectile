import { currentUser } from "@clerk/nextjs";
import { api } from "~/trpc/server";

export default async function Home() {
	const hello = await api.post.hello.query({ text: "from tRPC" });
	const user = await currentUser();

	return (
		<>
			<h1>Dashboard</h1>
			{user?.username}
		</>
	);
}
