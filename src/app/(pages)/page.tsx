import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function Home() {
	const hello = await api.post.hello.query({ text: "from tRPC" });
	const user = await currentUser();

	if (!user) redirect("/sign-in");

	return (
		<>
			<h1>Dashboard</h1>
			{user?.username}
		</>
	);
}
