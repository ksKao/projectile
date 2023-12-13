import React from "react";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { type Files } from "@prisma/client";
import FileRow from "./file-row";

export default function FilesTable({ files }: { files: Files[] }) {
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
					return <FileRow key={f.id} file={f} />;
				})}
			</TableBody>
		</Table>
	);
}
