"use client";
import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { type Files } from "@prisma/client";
import FileRow from "./file-row";
import { useProject } from "~/lib/contexts/projectContext";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";

type SortOrder = {
	field: "fileName" | "uploadedBy" | "uploadedOn";
	orderBy: "asc" | "desc";
};

function SortIcon({
	sortOrder,
	fieldName,
}: {
	sortOrder: SortOrder;
	fieldName: typeof sortOrder.field;
}) {
	if (sortOrder.field === fieldName) {
		if (sortOrder.orderBy === "asc") return <FaSortUp />;
		return <FaSortDown />;
	} else {
		return <FaSort />;
	}
}

export default function FilesTable({ files }: { files: Files[] }) {
	const [sortOrder, setSortOrder] = useState<SortOrder>({
		field: "uploadedBy",
		orderBy: "desc",
	});
	const project = useProject();

	const sortedFiles = files.sort((a, b) => {
		let bigger: Files, smaller: Files;
		if (sortOrder.orderBy === "asc") {
			(bigger = a), (smaller = b);
		} else {
			(smaller = a), (bigger = b);
		}
		if (sortOrder.field === "fileName") {
			return bigger.fileName.localeCompare(smaller.fileName);
		} else if (sortOrder.field === "uploadedBy") {
			const biggerMember = project.members.find(
				(m) => m.id === bigger.uploadedBy,
			);
			const smallerMember = project.members.find(
				(m) => m.id === smaller.uploadedBy,
			);
			if (!biggerMember?.username && !smallerMember?.username) return 0;
			if (!biggerMember?.username) return 1;
			if (!smallerMember?.username) return -1;

			return biggerMember.username.localeCompare(smallerMember.username);
		}
		return bigger.updatedAt.getTime() - smaller.updatedAt.getTime();
	});

	return (
		<Table className="mt-4">
			<TableHeader>
				<TableRow>
					<TableHead
						role="button"
						onClick={() =>
							setSortOrder((prev) => {
								return {
									field: "fileName",
									orderBy:
										prev.field === "fileName"
											? prev.orderBy === "asc"
												? "desc"
												: "asc"
											: "asc",
								};
							})
						}
					>
						<div className="w-full flex justify-between items-center">
							File Name
							<SortIcon
								fieldName="fileName"
								sortOrder={sortOrder}
							/>
						</div>
					</TableHead>
					<TableHead
						className="w-44"
						role="button"
						onClick={() =>
							setSortOrder((prev) => {
								return {
									field: "uploadedBy",
									orderBy:
										prev.field === "uploadedBy"
											? prev.orderBy === "asc"
												? "desc"
												: "asc"
											: "asc",
								};
							})
						}
					>
						<div className="w-full flex justify-between items-center">
							Uploaded By
							<SortIcon
								fieldName="uploadedBy"
								sortOrder={sortOrder}
							/>
						</div>
					</TableHead>
					<TableHead
						className="w-44"
						role="button"
						onClick={() =>
							setSortOrder((prev) => {
								return {
									field: "uploadedOn",
									orderBy:
										prev.field === "uploadedOn"
											? prev.orderBy === "asc"
												? "desc"
												: "asc"
											: "asc",
								};
							})
						}
					>
						<div className="w-full flex justify-between items-center">
							Uploaded On
							<SortIcon
								fieldName="uploadedOn"
								sortOrder={sortOrder}
							/>
						</div>
					</TableHead>
					<TableHead className="w-28">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sortedFiles.map((f) => {
					return <FileRow key={f.id} file={f} />;
				})}
			</TableBody>
		</Table>
	);
}
