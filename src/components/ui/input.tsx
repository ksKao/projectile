import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, errorMessage = "", ...props }, ref) => {
		return (
			<div>
				<input
					type={type}
					className={cn(
						`flex h-10 w-full rounded-md border ${
							errorMessage ? "border-red-500" : "border-input"
						} bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
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
Input.displayName = "Input";

export { Input };
