"use client";
import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type Project = {
	id: string;
	name: string;
	thumbnailUrl: string;
	members: (
		| {
				userId: string;
				imageUrl: string;
		  }
		| undefined
	)[];
};

export default function ProjectCard({ project }: { project: Project }) {
	const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
	return (
		<Card>
			<CardContent className="p-4 w-96 max-w-full">
				<div className="flex max-w-full">
					<div className="relative w-24 h-24">
						{!thumbnailLoaded && (
							<Skeleton className="rounded-md w-24 h-24 absolute" />
						)}
						<Image
							src={project.thumbnailUrl}
							alt={project.name}
							className="rounded-md object-cover"
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							onLoad={() => setThumbnailLoaded(true)}
						/>
					</div>
					<div className="ml-4 flex flex-col justify-between">
						<p className="font-bold text-2xl overflow-ellipsis overflow-hidden whitespace-nowrap max-w-[210px]">
							{project.name}
						</p>
						<div className="flex gap-2 mt-6">
							{project.members.map(
								(member) =>
									member && (
										<div key={member.userId}>
											<Image
												src={member.imageUrl}
												alt={member.userId}
												width={32}
												height={32}
												className="rounded-full"
											/>
										</div>
									),
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
