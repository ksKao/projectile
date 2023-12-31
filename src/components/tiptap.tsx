"use client";

import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./ui/button";
import {
	Bold,
	Italic,
	LucideHeading1,
	LucideHeading2,
	LucideHeading3,
	LucideHeading4,
	LucideTextQuote,
	UnderlineIcon,
} from "lucide-react";
import { Toggle } from "./ui/toggle";
import { type ReactNode } from "react";
import Underline from "@tiptap/extension-underline";
import { FaCode, FaListUl } from "react-icons/fa";
import { RiText } from "react-icons/ri";
import { FaListOl } from "react-icons/fa";
import { BiCodeBlock } from "react-icons/bi";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { twMerge } from "tailwind-merge";

type Props = {
	editable: boolean;
	setEditable?: (editable: boolean) => void;
	isSubmitting?: boolean;
	submitButtonText?: string;
	onSubmit?: (editor: Editor) => void;
	role?: React.AriaRole;
	className?: string;
	content: string;
	children?: ReactNode;
	onCancel?: (editor: Editor) => void;
	cancelButtonText?: string;
	placeholder?: string;
	submitDisabled?: boolean;
};

function Menubar({ editor }: { editor: Editor }) {
	const iconClassName = "w-4 h-4";
	return (
		<div className="rounded-md border border-input p-1 flex gap-1 max-w-full flex-wrap mb-4">
			<Toggle
				pressed={editor.isActive("bold")}
				onPressedChange={() =>
					editor.chain().focus().toggleBold().run()
				}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
			>
				<Bold className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("italic")}
				onPressedChange={() =>
					editor.chain().focus().toggleItalic().run()
				}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
			>
				<Italic className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("underline")}
				onPressedChange={() =>
					editor.chain().focus().toggleUnderline().run()
				}
				disabled={!editor.can().chain().focus().toggleUnderline().run()}
			>
				<UnderlineIcon className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("code")}
				onPressedChange={() =>
					editor.chain().focus().toggleCode().run()
				}
				disabled={!editor.can().chain().focus().toggleCode().run()}
			>
				<FaCode className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("paragraph")}
				onPressedChange={() =>
					editor.chain().focus().setParagraph().run()
				}
			>
				<RiText className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("heading", { level: 1 })}
				onPressedChange={() =>
					editor.chain().focus().toggleHeading({ level: 1 }).run()
				}
			>
				<LucideHeading1 className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("heading", { level: 2 })}
				onPressedChange={() =>
					editor.chain().focus().toggleHeading({ level: 2 }).run()
				}
			>
				<LucideHeading2 className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("heading", { level: 3 })}
				onPressedChange={() =>
					editor.chain().focus().toggleHeading({ level: 3 }).run()
				}
			>
				<LucideHeading3 className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("heading", { level: 4 })}
				onPressedChange={() =>
					editor.chain().focus().toggleHeading({ level: 4 }).run()
				}
			>
				<LucideHeading4 className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("bulletList")}
				onPressedChange={() =>
					editor.chain().focus().toggleBulletList().run()
				}
			>
				<FaListUl className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("orderedList")}
				onPressedChange={() =>
					editor.chain().focus().toggleOrderedList().run()
				}
			>
				<FaListOl className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("blockquote")}
				onPressedChange={() =>
					editor.chain().focus().toggleBlockquote().run()
				}
			>
				<LucideTextQuote className={iconClassName} />
			</Toggle>
			<Toggle
				pressed={editor.isActive("codeBlock")}
				onPressedChange={() =>
					editor.chain().focus().toggleCodeBlock().run()
				}
			>
				<BiCodeBlock className={iconClassName} />
			</Toggle>
		</div>
	);
}

export default function Tiptap({
	editable,
	setEditable,
	submitButtonText = "Submit",
	isSubmitting = false,
	role,
	className: editorClassName = "",
	onSubmit,
	content,
	onCancel,
	cancelButtonText = "Cancel",
	placeholder = "Type something...",
	submitDisabled = true,
}: Props) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				code: {
					HTMLAttributes: {
						class: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
					},
				},
				codeBlock: {
					HTMLAttributes: {
						class: "relative rounded bg-muted px-[0.6rem] py-[0.4rem] font-mono text-base font-semibold",
					},
				},
				blockquote: {
					HTMLAttributes: {
						class: "mt-6 border-l-2 pl-6 italic font-normal",
					},
				},
				paragraph: {
					HTMLAttributes: {
						// class: "my-2",
					},
				},
				heading: {
					levels: [1, 2, 3, 4],
					HTMLAttributes: {
						class: "my-2",
					},
				},
				bulletList: {
					keepMarks: true,
					keepAttributes: false,
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false,
				},
				listItem: {
					HTMLAttributes: {
						class: "my-0",
					},
				},
			}),
			Underline,
			Link.configure({
				HTMLAttributes: {
					class: "no-underline hover:underline",
				},
			}),
			Placeholder.configure({
				placeholder,
				emptyEditorClass:
					"cursor-text align-middle before:content-[attr(data-placeholder)] before:absolute before:top-2 before:left-2 before:text-mauve-11 before:opacity-50 before-pointer-events-none",
			}),
		],
		content,
		editorProps: {
			attributes: {
				class: "prose dark:prose-invert prose-base p-2 rounded-md min-w-full focus:outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			},
		},
		editable,
	});

	const handleClick = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>,
	) => {
		// Check if the clicked element is the <a> tag
		if ((event.target as HTMLElement).tagName !== "A") {
			setEditable?.(true);
		}
	};

	if (!editor) return null;

	editor.setEditable(editable);

	return (
		<div>
			{editable && <Menubar editor={editor} />}
			<div
				className={twMerge(
					"rounded-md border-input border",
					editorClassName,
				)}
			>
				<EditorContent
					editor={editor}
					role={role ? role : editable ? undefined : "button"}
					onClick={handleClick}
				/>
			</div>
			{editable && onSubmit && (
				<div className="flex gap-2 mt-4">
					<Button
						className="w-20"
						onClick={() => {
							onSubmit(editor);
						}}
						loading={isSubmitting}
						disabled={
							submitDisabled && editor.getHTML() === content
						}
					>
						{submitButtonText}
					</Button>
					{onCancel && (
						<Button
							className="w-20"
							variant="outline"
							onClick={() => onCancel(editor)}
						>
							{cancelButtonText}
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
