"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useResizeObserver from "use-resize-observer";
import { format } from "date-fns";
import { Avatar, AvatarImage } from "~/components/ui/avatar";

type Member =
	| {
			userId: string;
			imageUrl: string;
	  }
	| undefined;

type Project = {
	id: string;
	name: string;
	dueDate: Date;
	thumbnailUrl: string;
	members: Member[];
};

export default function ProjectCard({ project }: { project: Project }) {
	const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
	const [membersToRender, setMembersToRender] = useState<Member[]>([]);
	const [numberOfExtraMembers, setNumberOfExtraMembers] = useState(0);
	const divRef = useRef<HTMLDivElement>(null);
	const { ref } = useResizeObserver<HTMLDivElement>({
		onResize: ({ width = 0 }) => {
			// this is the number that will be shown when there is more members in a group than the width of the div
			setNumberOfExtraMembers(0);
			// take the min of the number of members in a project and the max number of members that can be rendered
			// width = width of the card
			// 16 = card left padding
			// 96 = width of project thumbnail
			// 16 = margin of members div
			// 16 = card right padding
			// the number is then minused by 1 to account for the last circle that shows the member count
			const numberOfMembersToRender = Math.min(
				Math.floor(
					(width - 16 - 96 - 16 - 16) / (memberImageDimension + 8) -
						1,
				),
				project.members.length,
			);

			if (project.members.length > numberOfMembersToRender) {
				setNumberOfExtraMembers(
					project.members.length - numberOfMembersToRender,
				);
			}

			setMembersToRender([]);
			for (let i = 0; i < numberOfMembersToRender; i++) {
				setMembersToRender((prev) => prev.concat([project.members[i]]));
			}
		},
	});
	const memberImageDimension = 32;

	return (
		<Card className="overflow-hidden w-full md:w-96 max-w-full" ref={ref}>
			<CardContent className="p-4 w-full">
				<div className="flex max-w-full">
					<div className="relative min-w-[96px] min-h-full">
						{!thumbnailLoaded && (
							<Skeleton className="rounded-md min-w-[96px] min-h-full absolute" />
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
					<div
						className="ml-4 flex flex-col justify-between flex-grow min-w-0"
						ref={divRef}
					>
						<p className="font-bold text-xl truncate">
							{project.name}
						</p>
						<p className="font-light text-gray-700 dark:text-gray-400 overflow-ellipsis whitespace-nowrap overflow-hidden">
							{format(project.dueDate, "eee, do MMM yy")}
						</p>
						<div className="flex gap-2 mt-6">
							{membersToRender.map(
								(member) =>
									member && (
										<div key={member.userId}>
											<Avatar className="w-9 h-9">
												<AvatarImage
													src={member.imageUrl}
													alt={member.userId}
												/>
											</Avatar>
										</div>
									),
							)}
							{numberOfExtraMembers > 0 && (
								<div className="bg-primary w-9 h-9 rounded-full flex items-center justify-center overflow-hidden text-white">
									+{numberOfExtraMembers}
								</div>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
