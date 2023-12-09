"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

export default function ColumnName({
	columnId,
	columnName,
}: {
	columnId: string;
	columnName: string;
}) {
	const [editing, setEditing] = useState(false);
	const [newColumnName, setNewColumnName] = useState(columnName);
	const inputRef = useRef<HTMLInputElement>(null);
	const utils = api.useUtils();
	const { mutate } = api.kanban.changeColumnName.useMutation({
		onSettled: () => utils.kanban.getColumns.invalidate(),
	});

	useEffect(() => {
		if (editing && inputRef.current) inputRef.current.focus();
	}, [editing]);

	return (
		<div className="flex-grow">
			<h2
				className={`font-bold p-2 whitespace-nowrap max-w-full overflow-ellipsis overflow-hidden`}
				role="button"
				onClick={() => setEditing(true)}
				hidden={editing}
			>
				{newColumnName}
			</h2>
			<div hidden={!editing}>
				<Input
					ref={inputRef}
					className={`w-full -mb-5`}
					value={newColumnName}
					onChange={(e) => setNewColumnName(e.target.value)}
					onBlur={() => {
						mutate({
							columnId,
							name: newColumnName,
						});
						setEditing(false);
					}}
				/>
			</div>
		</div>
	);
}
