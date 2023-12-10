import Link from "next/link";
import React from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import ThreadCard from "./thread-card";

export default async function ThreadsPage({
	params,
}: {
	params: { projectId: string };
}) {
	const threads = await api.threads.getThreads.query(params.projectId);

	return (
		<>
			<div className="flex justify-between items-center h-10">
				<h1 className="text-2xl font-bold">Threads</h1>
				<Button asChild>
					<Link href={`/${params.projectId}/threads/post`}>Post</Link>
				</Button>
			</div>
			<div className="min-w-full h-[calc(100%-40px)]">
				{threads.length === 0 ? (
					<div className="w-full h-full flex justify-center items-center">
						No posts
					</div>
				) : (
					threads.map((t) => <ThreadCard key={t.id} thread={t} />)
				)}
			</div>
		</>
	);
}
