import { currentUser } from "@clerk/nextjs";
import SettingsForm from "./settings-form";

export default async function Settings() {
	const user = await currentUser();

	return (
		<>
			<h1 className="font-bold text-3xl">Account Settings</h1>
			<SettingsForm
				defaultUsername={user?.username ?? ""}
				defaultImageUrl={user?.imageUrl ?? ""}
			/>
		</>
	);
}
