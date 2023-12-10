"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "~/components/ui/button";

export default function ThreadsPage() {
	const pathname = usePathname();
	return (
		<>
			<div className="flex justify-between items-center h-10">
				<h1 className="text-2xl font-bold">Threads</h1>
				<Button asChild>
					<Link href={`${pathname}/post`}>Post</Link>
				</Button>
			</div>
			<div className="min-w-full h-[calc(100%-40px)]">
				<div className="w-full h-full flex justify-center items-center">
					No posts
				</div>
			</div>
		</>
	);
}
