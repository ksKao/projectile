"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { IoCloseSharp } from "react-icons/io5";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { useProject } from "~/lib/contexts/projectContext";
import { useRouter } from "next/navigation";

export default function AddColumnButton() {
	const { mutate, isLoading } = api.kanban.addColumn.useMutation({
		onSuccess: () => {
			setColumnName("");
			setEditing(false);
			toast.success("A new column has been added");
			router.refresh();
		},
		onError: (e) => {
			if (e.data?.zodError) {
				const errors = e.data.zodError.fieldErrors;
				toast.error(errors?.name?.[0] ?? errors?.projectId?.[0] ?? "");
			} else {
				toast.error(e.message);
			}
		},
	});
	const project = useProject();
	const router = useRouter();
	const [editing, setEditing] = useState(false);
	const [columnName, setColumnName] = useState("");

	const addColumn: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();

		mutate({
			name: columnName,
			projectId: project?.id ?? "",
		});
	};

	return (
		<div
			className={`bg-input h-fit text-center ${
				editing
					? ""
					: "hover:bg-primary-foreground/90 dark:hover:bg-primary-foreground/50"
			} dark:bg-primary-foreground min-w-[16rem] border dark:border-0 rounded-md text-foreground`}
		>
			{editing ? (
				<div className="p-2">
					<form onSubmit={addColumn}>
						<Input
							placeholder="Column Name"
							id="columnName"
							value={columnName}
							onChange={(e) => setColumnName(e.target.value)}
						/>
						<div className="-mt-3 flex justify-start gap-2">
							<Button
								className="py-0"
								type="submit"
								loading={isLoading}
							>
								Add Column
							</Button>
							<Button
								variant="ghost"
								className="p-2"
								type="reset"
								onClick={() => setEditing(false)}
							>
								<IoCloseSharp className="h-6 w-6" />
							</Button>
						</div>
					</form>
				</div>
			) : (
				<div
					className="font-bold p-2"
					role="button"
					onClick={() => setEditing(true)}
				>
					Add a Column
				</div>
			)}
		</div>
	);
}
