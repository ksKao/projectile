import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	errorMessage?: string;
	label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, errorMessage = "", label, ...props }, ref) => {
		return (
			<div className="grid w-full items-center gap-1.5">
				{label && <Label htmlFor={props.id}>{label}</Label>}
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
						<span className="text-sm text-red-500">
							{errorMessage}
						</span>
					) : (
						<div className="h-5" />
					)}
				</div>
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input };
