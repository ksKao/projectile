import { currentUser } from "@clerk/nextjs";
import SettingsForm from "./settings-form";

export default async function Settings() {
	const user = await currentUser();

	return (
		<div className="max-h-full overflow-y-auto -mr-12 pr-12 scrollbar-hide md:scrollbar-default">
			<h1 className="font-bold text-3xl">Account Settings</h1>
			<SettingsForm
				defaultUsername={user?.username ?? ""}
				defaultImageUrl={user?.imageUrl ?? ""}
			/>
		</div>
	);
}
