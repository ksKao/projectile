"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { MdViewKanban } from "react-icons/md";
import { BiSolidDashboard, BiSolidMessageRoundedDetail } from "react-icons/bi";
import { FaFolder, FaPoll } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { useUser } from "@clerk/nextjs";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

export default function ProjectNav({
	project,
}: {
	project: inferRouterOutputs<AppRouter>["project"]["getProject"];
}) {
	const pathname = usePathname();
	const { user } = useUser();
	const links = [
		{
			title: "Dashboard",
			href: "",
			icon: BiSolidDashboard,
		},
		{
			title: "Tasks",
			href: "tasks",
			icon: MdViewKanban,
		},
		{
			title: "Threads",
			href: "threads",
			icon: BiSolidMessageRoundedDetail,
		},
		{
			title: "Files",
			href: "files",
			icon: FaFolder,
		},
		{
			title: "Polls",
			href: "polls",
			icon: FaPoll,
		},
	];
	const projectId = pathname.split("/")[1] ?? "";
	const currentLink = pathname.split("/")[2] ?? "";

	return (
		<nav className="w-screen bg-background items-center flex h-[8vh] rounded-b-md justify-around border-b md:static md:items-start md:w-72 md:h-full md:flex-col md:justify-start md:p-8 md:gap-8 md:border-r md:border-b-0 md:rounded-none">
			{links.map((link) => (
				<Link
					key={link.href}
					href={`/${projectId}/${link.href}`}
					className={`flex items-center gap-4 p-1 rounded-sm md:w-full md:p-4 ${
						link.href === currentLink ? "bg-primary" : "bg-none"
					}`}
				>
					<span>
						<link.icon
							className={`w-6 h-6 ${
								link.href === currentLink ? "text-white" : ""
							}`}
						/>
					</span>
					<p
						className={`hidden font-semibold md:block ${
							link.href === currentLink ? "text-white" : ""
						}`}
					>
						{link.title}
					</p>
				</Link>
			))}
			{user?.id === project?.leader && (
				<Link
					href={`/${projectId}/settings`}
					className={`flex items-center gap-4 p-1 rounded-sm md:w-full md:p-4 ${
						"settings" === currentLink ? "bg-primary" : "bg-none"
					}`}
				>
					<span>
						<FaGear
							className={`w-6 h-6 ${
								"settings" === currentLink ? "text-white" : ""
							}`}
						/>
					</span>
					<p
						className={`hidden font-semibold md:block ${
							"settings" === currentLink ? "text-white" : ""
						}`}
					>
						Settings
					</p>
				</Link>
			)}
		</nav>
	);
}
