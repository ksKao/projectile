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
import { type Files } from "@prisma/client";
import { IoMdDownload } from "react-icons/io";
import { HiOutlinePencil } from "react-icons/hi";
import { FaRegTrashCan } from "react-icons/fa6";
import { Button } from "~/components/ui/button";
import { useRouter } from "next-nprogress-bar";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import LoadingSpinner from "~/components/ui/loading-spinner";

export default function FilesTable({ files }: { files: Files[] }) {
	const project = useProject();
	const router = useRouter();
	const { user } = useUser();
	const { isLoading: getDownloadUrlLoading, mutate: getDownloadUrl } =
		api.files.getDownloadUrl.useMutation({
			onSuccess: (signedUrl) => {
				router.push(
					signedUrl,
					{},
					{
						showProgressBar: false,
					},
				);
			},
			onError: (e) => {
				toast.error(e.data?.zodError?.formErrors?.[0] ?? e.message);
			},
		});
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
									<Button
										variant="ghost"
										onClick={() => {
											getDownloadUrl(f.id);
										}}
										disabled={getDownloadUrlLoading}
									>
										{getDownloadUrlLoading ? (
											<LoadingSpinner className="w-4 h-4" />
										) : (
											<IoMdDownload className="w-4 h-4" />
										)}
									</Button>
									<Button variant="ghost">
										<HiOutlinePencil className="w-4 h-4" />
									</Button>
									<Button variant="ghost">
										<FaRegTrashCan className="w-4 h-4" />
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
