import React from "react";
import UpdateProjectNameForm from "./update-project-name-form";
import UpdateProjectDescriptionForm from "./updatae-project-description-form";

export default function ProjectSettingsPage() {
	return (
		<>
			<h1 className="text-2xl font-bold">Project Settings</h1>
			<div className="h-4" />
			<UpdateProjectNameForm />
			<UpdateProjectDescriptionForm />
		</>
	);
}
