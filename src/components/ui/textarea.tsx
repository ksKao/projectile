import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	errorMessage?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, errorMessage = "", ...props }, ref) => {
		return (
			<div>
				<textarea
					className={cn(
						`flex min-h-[80px] w-full rounded-md border ${
							errorMessage ? "border-red-500" : "border-input"
						} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
						className,
					)}
					ref={ref}
					{...props}
				/>
				{errorMessage ? (
					<span className="text-sm text-red-500">{errorMessage}</span>
				) : (
					<div className="h-5" />
				)}
			</div>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
