"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoCloseSharp } from "react-icons/io5";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { useProject } from "~/lib/contexts/projectContext";
import { useRouter } from "next/navigation";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";

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
	const divRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const [editing, setEditing] = useState(false);
	const [columnName, setColumnName] = useState("");

	const addColumn: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();

		if (!columnName) return;

		mutate({
			name: columnName,
			projectId: project?.id ?? "",
		});
	};

	return (
		<div className="h-fit">
			<Popover open={editing} onOpenChange={(open) => setEditing(open)}>
				<PopoverTrigger asChild>
					<div
						className="font-bold p-2 min-w-[16rem] text-center hover:bg-primary-foreground/90 dark:hover:bg-primary-foreground/50 dark:bg-primary-foreground rounded-md bg-input"
						role="button"
						ref={divRef}
						onClick={() => {
							divRef.current?.scrollIntoView();
							setEditing(true);
						}}
					>
						Add a Column
					</div>
				</PopoverTrigger>
				<PopoverContent className="min-w-[16rem] -mt-10">
					<div
						className={`bg-input h-fit text-center dark:bg-primary-foreground min-w-[16rem] border dark:border-0 rounded-md text-foreground p-2`}
					>
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
				</PopoverContent>
			</Popover>
		</div>
	);
}
