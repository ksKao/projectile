import React from "react";
import UpdateProjectNameForm from "./update-project-name-form";
import UpdateProjectDescriptionForm from "./updatae-project-description-form";
import UpdateProjectDueDateForm from "./update-project-due-date-form";
import UpdateProjectThumbnailForm from "./update-project-thumbnail-form";
import RegeneratePasswordForm from "./regenerate-password";

export default function ProjectSettingsPage() {
	return (
		<>
			<h1 className="text-2xl font-bold">Project Settings</h1>
			<div className="h-4" />
			<UpdateProjectNameForm />
			<UpdateProjectDescriptionForm />
			<div className="mt-5" />
			<UpdateProjectDueDateForm />
			<div className="mt-5" />
			<UpdateProjectThumbnailForm />
			<div className="mt-5" />
			<RegeneratePasswordForm />
		</>
	);
}
