import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import toast from "react-hot-toast";
import { IoCloseSharp } from "react-icons/io5";
import { Input } from "~/components/ui/input";
import { useProject } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/react";

type Column = inferRouterOutputs<AppRouter>["kanban"]["getColumns"][number];

export default function AddCardForm({
	column,
	setShow,
}: {
	column: Column;
	setShow: (show: boolean) => void;
}) {
	const divRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const project = useProject();
	const utils = api.useUtils();
	const { isLoading, mutate } = api.kanban.addTask.useMutation({
		onSuccess: () => {
			toast.success("A new card has been added");
		},
		onError: (e) => {
			if (e.data?.zodError) {
				const errors = e.data.zodError.fieldErrors;
				toast.error(
					errors?.projectId?.[0] ?? errors?.kanbanColumnId?.[0] ?? "",
				);
			} else {
				toast.error(e.message);
			}
		},
		onSettled: async () => {
			if (inputRef.current) {
				inputRef.current.disabled = false;
				inputRef.current.focus();
			}
			await utils.kanban.getColumns.invalidate();
		},
	});
	const [cardTitle, setCardTitle] = useState("");

	const addTask: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		if (!cardTitle) return;

		mutate({
			id: crypto.randomUUID(),
			title: cardTitle,
			projectId: project?.id ?? "",
			kanbanColumnId: column.id,
		});
		setCardTitle("");
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Check if the clicked element is outside the div
			if (
				divRef.current &&
				!divRef.current.contains(event.target as Node)
			) {
				setCardTitle("");
				setShow(false);
			}
		};

		// Attach the event listener when the component mounts
		document.addEventListener("click", handleClickOutside);

		divRef.current?.scrollIntoView();
		inputRef.current?.focus();

		// Clean up the event listener when the component unmounts
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [setShow]);

	return (
		<div
			className={`w-full mb-2 bg-primary-foreground dark:bg-slate-800 ${
				isLoading ? "opacity-50" : ""
			} rounded-md p-2`}
			ref={divRef}
		>
			<form onSubmit={addTask}>
				<Input
					type="text"
					disabled={isLoading}
					placeholder="Card Title"
					ref={inputRef}
					value={cardTitle}
					onChange={(e) => setCardTitle(e.target.value)}
				/>
				<div className="-mt-3 flex justify-start gap-2">
					<Button disabled={isLoading}>Add Card</Button>
					<Button
						variant="ghost"
						disabled={isLoading}
						className="p-2 hover:bg-slate-600/50"
						type="reset"
						onClick={() => setShow(false)}
					>
						<IoCloseSharp className="h-6 w-6" />
					</Button>
				</div>
			</form>
		</div>
	);
}
