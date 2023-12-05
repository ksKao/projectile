"use client";
import React, { useEffect, useRef, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { Button } from "./ui/button";
import { FaPlus } from "react-icons/fa";
import { Input } from "./ui/input";
import { IoCloseSharp } from "react-icons/io5";

type Props = inferRouterOutputs<AppRouter>["kanban"]["getColumns"][number];

function AddCardForm({ setShow }: { setShow: (show: boolean) => void }) {
	const divRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [cardTitle, setCardTitle] = useState("");

	const addCard: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		console.log(cardTitle);
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
	}, [setShow]); // Empty dependency array ensures the effect runs only once during mount and unmount

	return (
		<div
			className="w-full mb-2 bg-primary-foreground dark:bg-slate-800 rounded-md p-2"
			ref={divRef}
		>
			<form onSubmit={addCard}>
				<Input
					type="text"
					placeholder="Card Title"
					ref={inputRef}
					value={cardTitle}
					onChange={(e) => setCardTitle(e.target.value)}
				/>
				<div className="-mt-3 flex justify-start gap-2">
					<Button>Add Card</Button>
					<Button
						variant="ghost"
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

export default function TaskColumn({ column }: { column: Props }) {
	const dummyDiv = useRef<HTMLDivElement>(null);
	const [showForm, setShowForm] = useState(false);

	return (
		<div className="flex flex-col min-w-[16rem] h-fit max-h-full bg-input dark:bg-primary-foreground w-64 pb-2 border dark:border-0 rounded-md overflow-y-hidden">
			<h2 className="font-bold p-2 whitespace-nowrap max-w-full overflow-ellipsis overflow-hidden">
				{column.name}
			</h2>
			<div className="flex-grow max-h-[calc(100%-40px-16px)] overflow-y-auto px-2 mt-2">
				<div className="w-full h-32 mb-2 bg-primary-foreground dark:bg-input"></div>
				<div className="w-full h-32 mb-2 bg-primary-foreground dark:bg-input"></div>
				<div className="w-full h-32 mb-2 bg-primary-foreground dark:bg-input"></div>
				<div className="w-full h-32 mb-2 bg-primary-foreground dark:bg-input"></div>
				<div className="w-full h-32 mb-2 bg-primary-foreground dark:bg-input"></div>
				{showForm && <AddCardForm setShow={setShowForm} />}
				<div ref={dummyDiv} className="w-full" />
			</div>
			<Button
				variant="ghost"
				className={`m-2 mb-0 px-2 font-semibold justify-start ${
					showForm ? "hidden" : ""
				}`}
				onClick={() => {
					setShowForm(true);
					dummyDiv.current?.scrollIntoView({
						behavior: "smooth",
						block: "end",
					});
				}}
			>
				<FaPlus className="mr-2" /> Add a card
			</Button>
		</div>
	);
}
