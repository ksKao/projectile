"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./ui/button";

type Props = {
	save: () => void;
	content: string;
};

const Tiptap = ({ save, content }: Props) => {
	const editor = useEditor({
		extensions: [StarterKit],
		content,
		editorProps: {
			attributes: {
				class: "prose dark:prose-invert prose-base p-2 rounded-md border-input border focus:outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			},
		},
	});

	if (!editor) return null;

	return (
		<>
			<EditorContent editor={editor} />
			<Button onClick={() => console.log(editor.getHTML())}>Save</Button>
		</>
	);
};

export default Tiptap;
