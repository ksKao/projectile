"use client";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { MdModeEdit } from "react-icons/md";
import { Label } from "~/components/ui/label";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { Skeleton } from "~/components/ui/skeleton";
import { useProject } from "~/lib/contexts/projectContext";
import { supabaseClient } from "~/lib/supabaseClient";
import { api } from "~/trpc/react";

export default function UpdateProjectThumbnailForm() {
	const project = useProject();
	const utils = api.useUtils();
	const [projectThumbnail, setProjectThumbnail] = useState<File | null>(null);
	const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(
		project.thumbnailUrl,
	);
	const [imageLoading, setImageLoading] = useState(true);
	const [uploadingImage, setUploadingImage] = useState(false);
	const { mutate } = api.project.updateProjectThumbnail.useMutation({
		onSuccess: async (data) => {
			if (!projectThumbnail) return;
			try {
				const res = await supabaseClient.storage
					.from("projects")
					.uploadToSignedUrl(
						data.path,
						data.token,
						projectThumbnail,
						{
							upsert: true,
						},
					);

				if (res.error) throw new Error(res.error.message);
				await utils.project.getProject.invalidate();
			} catch (e) {
				if (e instanceof Error) toast.error(e.message);
				else
					toast.error(
						"Something went wront while uploading image. Please try again",
					);
			}
			toast.success("Project thumbnail has been updated");
		},
		onError: (e) => {
			const error = e.data?.zodError?.fieldErrors;
			toast.error(error?.newFileName?.[0] ?? error?.id?.[0] ?? e.message);
		},
		onSettled: () => setUploadingImage(false),
	});

	function handleSubmit(file: File) {
		setUploadingImage(true);
		setProjectThumbnail(file);
		setThumbnailPreviewUrl(URL.createObjectURL(file));
		mutate({
			id: project.id,
			newFileName: file.name,
		});
	}

	return (
		<>
			<Label htmlFor="projectThumbnail">Project Thumbnail</Label>
			<div className="relative w-[150px] h-[150px] rounded-md overflow-hidden">
				<input
					type="file"
					id="projectThumbnail"
					className="hidden"
					accept="image/png, image/jpeg"
					onChange={(e) => {
						const file = e.currentTarget.files?.[0] ?? null;
						if (!file) return;
						if (file.size > 20_000_000) {
							toast.error("Image cannot exceed 20MB");
							return;
						}
						handleSubmit(file);
					}}
					disabled={uploadingImage || imageLoading}
				/>
				<label
					htmlFor="projectThumbnail"
					className={`relative overflow-hidden ${
						uploadingImage || imageLoading ? "" : "cursor-pointer"
					}`}
				>
					<div
						className={`${
							uploadingImage ? "opacity-70" : "opacity-0"
						} hover:opacity-70 w-[150px] h-[150px] bg-black flex items-center justify-center`}
					>
						{uploadingImage ? (
							<LoadingSpinner />
						) : (
							<>
								<MdModeEdit />
								<p className="ml-2 font-semibold">Change</p>
							</>
						)}
					</div>
					<Skeleton
						className={`w-[150px] h-[150px] absolute top-0 left-0 ${
							imageLoading ? "" : "hidden"
						}`}
					/>
					<Image
						src={thumbnailPreviewUrl}
						alt={project.name}
						width={150}
						height={150}
						className="absolute top-0 left-0 -z-10 aspect-square object-cover"
						priority
						onLoad={() => setImageLoading(false)}
					/>
				</label>
			</div>
		</>
	);
}
