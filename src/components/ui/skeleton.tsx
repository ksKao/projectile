import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(function Skeleton({ className, ...props }, ref) {
	return (
		<div
			className={cn("animate-pulse rounded-md bg-muted", className)}
			ref={ref}
			{...props}
		/>
	);
});

export { Skeleton };
