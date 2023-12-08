import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { IoCalendarClear, IoClose } from "react-icons/io5";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";

export default function TaskDueDatePicker({
	dueDate: defaultDueDate,
	taskId,
}: {
	dueDate: Date | null;
	taskId: string;
}) {
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [dueDate, setDueDate] = useState(defaultDueDate);
	const utils = api.useUtils();
	const { isLoading, mutate } = api.kanban.modifyTaskDueDate.useMutation({
		onSuccess: () => toast.success("Due date modified successfully"),
		onError: (e) =>
			toast.error(
				e.data?.zodError?.fieldErrors?.dueDate?.[0] ??
					e.data?.zodError?.fieldErrors?.taskId?.[0] ??
					e.message,
			),
		onSettled: () => utils.kanban.getColumns.invalidate(),
	});

	return (
		<div>
			<p className="text-muted-foreground">Task Due Date</p>
			<div className="flex items-end gap-2">
				<Popover
					modal
					open={calendarOpen}
					onOpenChange={(isOpen) => setCalendarOpen(isOpen)}
				>
					<PopoverTrigger asChild disabled={isLoading}>
						<Button
							variant="outline"
							className="w-56 text-left font-normal flex justify-between mt-2 gap-4"
							type="button"
						>
							<span className="text-muted-foreground">
								{dueDate
									? format(dueDate, "PPP")
									: "No due date"}
							</span>
							{isLoading ? (
								<LoadingSpinner className="w-4 h-4" />
							) : (
								<IoCalendarClear />
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							selected={dueDate ?? undefined}
							onSelect={(d) => {
								setDueDate(d ?? null);
								mutate({
									dueDate: d ?? null,
									taskId,
								});
								setCalendarOpen(false);
							}}
						/>
					</PopoverContent>
				</Popover>
				<Button
					variant="outline"
					onClick={() => {
						if (dueDate !== null) {
							setDueDate(null);
							mutate({
								taskId,
								dueDate: null,
							});
						}
					}}
					className={isLoading ? "opacity-0" : ""}
				>
					<IoClose />
				</Button>
			</div>
		</div>
	);
}
