"use client";

import React, { useState } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Skeleton } from "~/components/ui/skeleton";
import { format } from "date-fns";
import { FaUserMinus } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useProject } from "~/lib/contexts/projectContext";

export default function Project() {
	const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
	const { user } = useUser();
	const project = useProject();

	if (!project) notFound();

	return (
		<>
			<h1 className="text-2xl font-bold">Project Dashboard</h1>
			<div className="flex flex-col md:flex-row mt-4">
				<div className="relative w-36 h-36">
					{!thumbnailLoaded && (
						<Skeleton className="rounded-md w-36 h-36 absolute" />
					)}
					<Image
						src={project.thumbnailUrl}
						alt={project.name}
						className="rounded-md object-cover -z-10"
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						onLoad={() => setThumbnailLoaded(true)}
					/>
				</div>
				<div className="flex-grow mt-2 md:mt-0 md:ml-4 min-h-full flex flex-col">
					<div>
						<h2 className="font-semibold text-lg">
							{project.name}
						</h2>
						<p className="font-light text-gray-700 dark:text-gray-400 overflow-ellipsis whitespace-nowrap overflow-hidden">
							Due {format(project.dueDate, "eee, do MMM yy")}
						</p>
					</div>
					<p className="flex-grow mt-2 italic font-thin">
						{project.description
							? project.description
							: "This project currently has no description"}
					</p>
				</div>
			</div>
			<h2 className="text-2xl font-bold mt-8">Members</h2>
			<ul className="py-4">
				{project.members
					.sort(
						(a, b) =>
							a.username?.localeCompare(b.username ?? "") ?? 1,
					)
					.map((m) => (
						<li key={m.id} className="flex mb-4 justify-between">
							<div className="flex gap-4 items-center">
								<Image
									src={m.imageUrl}
									alt={m.username ?? m.id}
									width={40}
									height={40}
									className="rounded-full"
								/>
								<p>
									{m.username}{" "}
									{project.leader === m.id && (
										<span className="font-light">
											(Leader)
										</span>
									)}
								</p>
							</div>
							{project.leader === user?.id &&
								m.id !== user.id && (
									<Button variant="destructive">
										<FaUserMinus />
									</Button>
								)}
						</li>
					))}
			</ul>
		</>
	);
}
