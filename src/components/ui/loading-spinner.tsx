import { CgSpinner } from "react-icons/cg";
import { cn } from "~/lib/utils";

export default function LoadingSpinner({ className }: { className?: string }) {
	return (
		<CgSpinner className={cn("h-10 w-10 animate-spin", className ?? "")} />
	);
}
