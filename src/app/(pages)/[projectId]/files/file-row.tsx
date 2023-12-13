"use client";
import { useUser } from "@clerk/nextjs";
import { type Files } from "@prisma/client";
import { format } from "date-fns";
import React, { useRef, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { HiOutlinePencil } from "react-icons/hi";
import { IoMdDownload } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";
import { useProject } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/react";
import { useRouter } from "next-nprogress-bar";
import toast from "react-hot-toast";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

export default function FileRow({ file }: { file: Files }) {
	const project = useProject();
	const { user } = useUser();
	const router = useRouter();
	const [newFileName, setNewFileName] = useState(file.fileName);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [inputFocused, setInputFocused] = useState(false); // used to check if the edit input has been focused, so that the text only highlights on first focus
	const [newFileNameError, setNewFileNameError] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
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
	const { isLoading: editFileNameLoading, mutate: editFileName } =
		api.files.editFileName.useMutation({
			onSuccess: () => {
				router.refresh();
				setEditModalOpen(false);
			},
			onError: (e) =>
				toast.error(
					e.data?.zodError?.fieldErrors.newFileName?.[0] ?? e.message,
				),
		});
	const { isLoading: deleteFileLoading, mutate: deleteFile } =
		api.files.deleteFile.useMutation({
			onSuccess: () => {
				toast.success("File has been deleted");
				router.refresh();
				setDeleteModalOpen(false);
			},
			onError: (e) => {
				toast.error(e.data?.zodError?.formErrors?.[0] ?? e.message);
			},
		});

	return (
		<TableRow>
			<TableCell>{file.fileName}</TableCell>
			<TableCell>
				<div className="flex items-center gap-2 min-h-full">
					<Avatar className="w-8 h-8">
						<AvatarImage
							src={
								project.members.find((m) => m.id === user?.id)
									?.imageUrl
							}
							alt={file.uploadedBy}
						/>
						<AvatarFallback>N/A</AvatarFallback>
					</Avatar>
					{project.members.find((m) => m.id === user?.id ?? "")
						?.username ?? "Removed"}
				</div>
			</TableCell>
			<TableCell>{format(file.createdAt, "PPP")}</TableCell>
			<TableCell>
				<div className="flex h-full w-full justify-between">
					<Button
						variant="ghost"
						onClick={() => {
							getDownloadUrl(file.id);
						}}
						loading={getDownloadUrlLoading}
					>
						<IoMdDownload className="w-4 h-4" />
					</Button>
					<Dialog
						open={editModalOpen}
						onOpenChange={(open) => {
							setEditModalOpen(open);
							setNewFileName(file.fileName);
							setNewFileNameError("");
							// when closing modal, reset input focused
							if (!open) setInputFocused(false);
						}}
					>
						<DialogTrigger asChild>
							<Button variant="ghost">
								<HiOutlinePencil className="w-4 h-4" />
							</Button>
						</DialogTrigger>
						<DialogContent
							onOpenAutoFocus={(e) => {
								e.preventDefault();
								inputRef.current?.focus();
							}}
						>
							<DialogHeader>
								<DialogTitle> Edit File Name</DialogTitle>
							</DialogHeader>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									setNewFileNameError("");
									if (newFileName.length > 100) {
										setNewFileNameError(
											"File name must be less than 100 characters",
										);
										return;
									}
									editFileName({
										fileId: file.id,
										newFileName,
									});
								}}
							>
								<Input
									placeholder="New file name"
									value={newFileName}
									onChange={(e) =>
										setNewFileName(e.target.value)
									}
									errorMessage={newFileNameError}
									onFocus={() => {
										if (inputFocused) return;
										setInputFocused(true);
										inputRef.current?.setSelectionRange(
											0,
											newFileName.lastIndexOf("."),
										);
									}}
									ref={inputRef}
								/>
								<div className="flex w-full justify-end gap-2 flex-row">
									<Button
										variant="ghost"
										type="button"
										onClick={() => {
											setNewFileName(file.fileName);
											setEditModalOpen(false);
										}}
									>
										Cancel
									</Button>
									<Button
										disabled={
											newFileName === file.fileName ||
											newFileName.length === 0
										}
										loading={editFileNameLoading}
									>
										Save
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
					<Dialog
						open={deleteModalOpen}
						onOpenChange={(open) => setDeleteModalOpen(open)}
					>
						<DialogTrigger asChild>
							<Button variant="ghost">
								<FaRegTrashCan className="w-4 h-4" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Delete File?</DialogTitle>
							</DialogHeader>
							This file will be deleted and cannot be recovered.
							Are you sure?
							<div className="w-full justify-end flex gap-2">
								<Button
									variant="ghost"
									onClick={() => setDeleteModalOpen(false)}
								>
									Cancel
								</Button>
								<Button
									variant="destructive"
									loading={deleteFileLoading}
									onClick={() => {
										deleteFile(file.id);
									}}
								>
									Delete
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</TableCell>
		</TableRow>
	);
}
