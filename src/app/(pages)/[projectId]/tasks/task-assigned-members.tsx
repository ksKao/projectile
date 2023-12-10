import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import toast from "react-hot-toast";
import { FaUserPlus } from "react-icons/fa6";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { useProject } from "~/lib/contexts/projectContext";
import { api } from "~/trpc/react";

export default function TaskAssignedMembers({
	members,
	taskId,
}: {
	members: string[];
	taskId: string;
}) {
	const project = useProject();
	const utils = api.useUtils();
	const { isLoading, mutate } =
		api.kanban.modifyTaskAssignedMember.useMutation({
			onSuccess: (message) => toast.success(message),
			onError: (e) => toast.error(e.message),
			onSettled: () => utils.kanban.getColumns.invalidate(),
		});

	const notAssignedMembers = project.members.filter(
		(projectMember) =>
			members.find(
				(taskMemberId) => taskMemberId === projectMember.id,
			) === undefined,
	);

	return (
		<div>
			<p className="text-muted-foreground">Assigned members</p>
			<ul className="mt-2 flex gap-2 w-64">
				{members.slice(0, members.length > 5 ? 4 : 5).map((m) => {
					const member = project.members.find(
						(member) => member.id === m,
					);
					if (!member) return null;
					return (
						<li key={m}>
							<Avatar
								className="w-9 h-9"
								role="button"
								onClick={() =>
									mutate({
										userId: m,
										taskId,
										action: "remove",
									})
								}
							>
								<AvatarImage src={member.imageUrl} />
							</Avatar>
						</li>
					);
				})}
				{members.length > 5 && (
					<Popover>
						<PopoverTrigger asChild>
							<li className="bg-primary w-9 h-9 rounded-full flex items-center justify-center overflow-hidden text-white cursor-pointer">
								+{members.length - 4}
							</li>
						</PopoverTrigger>
						<PopoverContent className="flex gap-2 w-fit p-2">
							{members.slice(4, members.length).map((m) => {
								const member = project.members.find(
									(member) => member.id === m,
								);
								if (!member) return null;
								return (
									<Avatar
										key={m}
										className="w-9 h-9"
										role="button"
										onClick={() =>
											mutate({
												userId: m,
												taskId,
												action: "remove",
											})
										}
									>
										<AvatarImage src={member.imageUrl} />
									</Avatar>
								);
							})}
						</PopoverContent>
					</Popover>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild disabled={isLoading}>
						{notAssignedMembers.length > 0 && (
							<button className="w-9 h-9 rounded-full text-secondary-foreground bg-secondary flex justify-center items-center">
								{isLoading ? (
									<LoadingSpinner className="w-6 h-6" />
								) : (
									<FaUserPlus className="w-5 h-5" />
								)}
							</button>
						)}
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						{notAssignedMembers.map((remainingMember) => (
							<DropdownMenuItem
								key={remainingMember.id}
								textValue={remainingMember.id}
								onSelect={() => {
									mutate({
										userId: remainingMember.id,
										taskId,
										action: "add",
									});
								}}
								disabled={isLoading}
								className="flex items-center gap-2"
							>
								<Avatar className="w-5 h-5">
									<AvatarImage
										src={remainingMember.imageUrl}
									/>
								</Avatar>
								<p className="text-base">
									{remainingMember.username}
								</p>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</ul>
		</div>
	);
}
