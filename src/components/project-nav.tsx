"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { MdViewKanban } from "react-icons/md";
import { BiSolidDashboard, BiSolidMessageRoundedDetail } from "react-icons/bi";
import { FaFolder, FaPoll } from "react-icons/fa";

export default function ProjectNav() {
	const pathname = usePathname();
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
		<nav className="fixed bottom-0 w-screen items-center flex h-[8vh] rounded-t-md justify-around border-t md:static md:items-start md:w-72 md:h-full md:flex-col md:justify-start md:p-8 md:gap-8 md:border-r md:border-t-0 md:rounded-none">
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
		</nav>
	);
}
