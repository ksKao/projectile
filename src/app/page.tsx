import { api } from "~/trpc/server";

export default async function Home() {
	const hello = await api.post.hello.query({ text: "from tRPC" });

	return (
		<>
			<h1>Dashboard</h1>
		</>
	);
}
