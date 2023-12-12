"use client";
import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { format } from "date-fns";
import { useProject } from "~/lib/contexts/projectContext";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { IoMdDownload } from "react-icons/io";
import { HiOutlinePencil } from "react-icons/hi";
import { FaRegTrashCan } from "react-icons/fa6";
import { Button } from "~/components/ui/button";
import Link from "next/link";

type File = inferRouterOutputs<AppRouter>["files"]["getFiles"][number];

export default function FilesTable({ files }: { files: File[] }) {
	const project = useProject();
	const { user } = useUser();
	return (
		<Table className="mt-4">
			<TableHeader>
				<TableRow>
					<TableHead>File Name</TableHead>
					<TableHead className="w-44">Uploaded By</TableHead>
					<TableHead className="w-44">Uploaded On</TableHead>
					<TableHead className="w-28">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{files.map((f) => {
					return (
						<TableRow key={f.id}>
							<TableCell>{f.fileName}</TableCell>
							<TableCell>
								<div className="flex items-center gap-2 min-h-full">
									<Avatar className="w-8 h-8">
										<AvatarImage
											src={
												project.members.find(
													(m) => m.id === user?.id,
												)?.imageUrl
											}
											alt={f.uploadedBy}
										/>
										<AvatarFallback>N/A</AvatarFallback>
									</Avatar>
									{project.members.find(
										(m) => m.id === user?.id ?? "",
									)?.username ?? "Removed"}
								</div>
							</TableCell>
							<TableCell>{format(f.createdAt, "PPP")}</TableCell>
							<TableCell>
								<div className="flex h-full w-full justify-between">
									<Button variant="ghost" asChild>
										<Link
											href={f.downloadUrl}
											download={f.fileName}
										>
											<IoMdDownload />
										</Link>
									</Button>
									<Button variant="ghost">
										<HiOutlinePencil />
									</Button>
									<Button variant="ghost">
										<FaRegTrashCan />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
