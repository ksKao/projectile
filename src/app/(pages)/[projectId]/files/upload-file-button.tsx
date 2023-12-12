"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { supabaseClient } from "~/lib/supabaseClient";
import { api } from "~/trpc/react";

export default function UploadFileButton({ projectId }: { projectId: string }) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { mutate: uploadFile } = api.files.uploadFile.useMutation({
		onSuccess: async (data) => {
			if (!file) return;
			let res;
			try {
				res = await supabaseClient.storage
					.from("projects")
					.uploadToSignedUrl(data.path, data.token, file);
				if (res.error) {
					// if image failed to upload, delete the record in db
					deleteFile(data.fileId);
					toast.error(res.error.message);
				} else {
					toast.success("File has been successfully uploaded");
					setOpen(false);
					router.refresh();
				}
			} catch {
				toast.error("Something went wrong. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		},
		onError: (e) => {
			const error = e.data?.zodError?.fieldErrors;
			toast.error(
				error?.fileName?.[0] ?? error?.projectId?.[0] ?? e.message,
			);
		},
		onSettled: () => {
			setIsLoading(false);
		},
	});
	const { mutate: deleteFile } = api.files.deleteFile.useMutation();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Upload</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Upload File</DialogTitle>
				</DialogHeader>
				<form
					className="mt-4"
					onSubmit={(e) => {
						e.preventDefault();
						if (!file) return;
						setIsLoading(true);
						uploadFile({
							projectId,
							fileName: file.name,
						});
					}}
				>
					<Input
						type="file"
						label="File"
						name="file"
						errorMessage={
							file && file.size > 20_000_000
								? "File size cannot be larger than 20MB"
								: ""
						}
						onChange={(e) => {
							setFile(e.currentTarget.files?.[0] ?? null);
						}}
					/>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							type="button"
							onClick={() => {
								setFile(null);
								setOpen(false);
							}}
						>
							Cancel
						</Button>
						<Button
							loading={isLoading}
							disabled={file === null || file.size > 20_000_000}
						>
							Upload
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
