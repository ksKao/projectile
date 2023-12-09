"use client";

import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./ui/button";
import { Bold, Italic } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { type ReactNode } from "react";

type Props = {
	editable: boolean;
	setEditable: (editable: boolean) => void;
	setShowEditor?: (showEditor: boolean) => void;
	isSubmitting: boolean;
	save: (data: string) => void;
	content: string;
	children?: ReactNode;
};

function Menubar({ editor }: { editor: Editor }) {
	return (
		<div className="rounded-md border border-input p-1 flex gap-1">
			<Toggle
				pressed={editor.isActive("bold")}
				onPressedChange={() =>
					editor.chain().focus().toggleBold().run()
				}
			>
				<Bold className="w-4 h-4" />
			</Toggle>
			<Toggle
				pressed={editor.isActive("italic")}
				onPressedChange={() =>
					editor.chain().focus().toggleItalic().run()
				}
			>
				<Italic className="w-4 h-4" />
			</Toggle>
		</div>
	);
}

export default function Tiptap({
	editable,
	setEditable,
	setShowEditor,
	isSubmitting,
	save,
	content,
}: Props) {
	const editor = useEditor({
		extensions: [StarterKit],
		content,
		editorProps: {
			attributes: {
				class: "prose dark:prose-invert prose-base p-2 rounded-md border-input border focus:outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			},
		},
		editable,
	});

	if (!editor) return null;

	editor.setEditable(editable);

	return (
		<>
			{editable && <Menubar editor={editor} />}
			<EditorContent
				editor={editor}
				role={editable ? undefined : "button"}
				onClick={() => {
					setEditable(true);
				}}
			/>
			{editable && (
				<div className="flex gap-2">
					<Button
						className="w-20"
						onClick={() => {
							save(editor.getHTML());
						}}
						loading={isSubmitting}
						disabled={editor.getHTML() === content}
					>
						Save
					</Button>
					<Button
						className="w-20"
						variant="outline"
						onClick={() => {
							setEditable(false);
							editor.commands.setContent(content);
							if (editor.getText().length === 0 && setShowEditor)
								setShowEditor(false);
						}}
					>
						Cancel
					</Button>
				</div>
			)}
		</>
	);
}
