"use client";

import React from "react";
import Tiptap from "~/components/tiptap";

export default function CommentForm() {
	return (
		<div className="mt-4 rounded-md bg-muted/50 p-4">
			<Tiptap
				editable
				content=""
				onSubmit={() => console.log("submit")}
				isSubmitting={false}
				placeholder="Write a comment..."
			/>
		</div>
	);
}
