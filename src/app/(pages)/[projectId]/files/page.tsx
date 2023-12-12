import React from "react";
import { api } from "~/trpc/server";
import UploadFileButton from "./upload-file-button";
import FilesTable from "./files-table";

export default async function FilesPage({
	params,
}: {
	params: {
		projectId: string;
	};
}) {
	const files = await api.files.getFiles.query(params.projectId);

	return (
		<>
			<div className="flex justify-between items-center h-10">
				<h1 className="text-2xl font-bold">Files</h1>
				<UploadFileButton projectId={params.projectId} />
			</div>
			<FilesTable files={files} />
		</>
	);
}
