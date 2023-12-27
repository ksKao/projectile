"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import React, { type FormEventHandler, useState, useRef } from "react";
import toast from "react-hot-toast";
import { IoMdTrash } from "react-icons/io";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { changePasswordSchema } from "~/lib/schema";

const emptyPasswords = {
	newPassword: "",
	currentPassword: "",
	confirmPassword: "",
};

export default function SettingsForm({
	defaultUsername,
	defaultImageUrl,
}: {
	defaultUsername: string;
	defaultImageUrl: string;
}) {
	const { user, isLoaded } = useUser();

	const [username, setUsername] = useState(defaultUsername ?? "");
	const [password, setPassword] = useState(emptyPasswords);
	const [passwordError, setPasswordError] = useState(emptyPasswords);
	const [profileLoading, setProfileLoading] = useState(false);
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [image, setImage] = useState<File | null>(null);
	const [previewImageUrl, setPreviewImageUrl] = useState(
		defaultImageUrl ?? "",
	);
	const router = useRouter();
	const { user: clerk } = useClerk();
	const fileInputRef = useRef<HTMLInputElement>(null);

	if (!user || !isLoaded)
		return (
			<div className="flex flex-grow justify-center items-center">
				<LoadingSpinner />
			</div>
		);

	const handleProfileSubmit: FormEventHandler<HTMLFormElement> = async (
		e,
	) => {
		e.preventDefault();

		if (profileLoading) return;

		setProfileLoading(true);

		try {
			if (username && username !== defaultUsername) {
				await clerk?.update({
					username,
				});
			}

			if (image) {
				await clerk?.setProfileImage({
					file: image,
				});
			}

			setImage(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
			toast.success("Your profile has been updated");
			router.refresh();
		} catch (e: any) {
			if (e.errors?.[0]?.longMessage) {
				toast.error(e.errors[0].longMessage);
			} else if (e.errors?.[0]?.message) {
				toast.error(e.errors[0].message);
			} else if (e instanceof Error) {
				toast.error(e.message);
			} else {
				toast.error("Something went wrong. Please try again");
			}
		} finally {
			setProfileLoading(false);
		}
	};

	const handlePasswordSubmit: FormEventHandler<HTMLFormElement> = async (
		e,
	) => {
		e.preventDefault();

		setPasswordError(emptyPasswords);

		const parsed = changePasswordSchema.safeParse(password);

		if (!parsed.success) {
			const e = parsed.error.flatten().fieldErrors;
			setPasswordError({
				currentPassword: e.currentPassword?.[0] ?? "",
				newPassword: e.newPassword?.[0] ?? "",
				confirmPassword: e.confirmPassword?.[0] ?? "",
			});
			return;
		}

		setPasswordLoading(true);

		try {
			await clerk?.updatePassword({
				currentPassword: parsed.data.currentPassword,
				newPassword: parsed.data.newPassword,
				signOutOfOtherSessions: true,
			});

			toast.success("Your password has been updated.");
		} catch (e: any) {
			if (e.errors?.[0]?.longMessage) {
				toast.error(e.errors[0].longMessage);
			} else if (e.errors?.[0]?.message) {
				toast.error(e.errors[0].message);
			} else if (e instanceof Error) {
				toast.error(e.message);
			} else {
				toast.error("Something went wrong. Please try again");
			}
		} finally {
			setPasswordLoading(false);
		}
	};

	return (
		<div className="w-full md:max-w-[500px] py-4">
			<form onSubmit={handleProfileSubmit}>
				<div className="my-4">
					<h2 className="font-semibold text-lg my-4">Profile</h2>
					<Input
						label="Username"
						id="username"
						name="username"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<Label htmlFor="profilePicture">Profile Picture</Label>
					<div className="flex flex-col items-center gap-4">
						<div className="relative w-[100px] h-[100px] rounded-full overflow-hidden mt-2">
							<div
								className={`relative overflow-hidden ${
									!profileLoading && user.hasImage
										? "cursor-pointer"
										: "cursor-default"
								}`}
							>
								<div
									className={`${
										user.hasImage
											? profileLoading
												? "opacity-70"
												: "opacity-0 hover:opacity-70"
											: "opacity-0"
									} w-[100px] h-[100px] bg-black flex items-center justify-center`}
									onClick={async () => {
										try {
											if (!user.hasImage) return;

											setProfileLoading(true);
											await clerk?.setProfileImage({
												file: null,
											});

											toast.success(
												"Profile image has been removed successfully",
											);
											await user.reload();
											setPreviewImageUrl(user.imageUrl);
										} catch {
										} finally {
											setProfileLoading(false);
										}
									}}
								>
									{profileLoading ? (
										<LoadingSpinner />
									) : (
										<>
											<IoMdTrash />
											<p className="ml-1 font-semibold">
												Remove
											</p>
										</>
									)}
								</div>
								<Image
									src={previewImageUrl}
									alt={user.username ?? user.id}
									width={100}
									height={100}
									className="absolute top-0 left-0 -z-10 aspect-square object-cover"
									priority
								/>
							</div>
						</div>
						<Input
							type="file"
							// className="hidden"
							ref={fileInputRef}
							id="profilePicture"
							name="profilePicture"
							accept="image/png, image/jpg"
							disabled={profileLoading}
							onChange={(e) => {
								const file = e.currentTarget.files?.[0];
								if (!file) return;
								setImage(file);
								setPreviewImageUrl(URL.createObjectURL(file));
							}}
						/>
					</div>
					<div className="w-full flex justify-end mt-4">
						<Button
							disabled={username === defaultUsername && !image}
							loading={profileLoading}
						>
							Save Changes
						</Button>
					</div>
				</div>
			</form>
			<form onSubmit={handlePasswordSubmit}>
				<div className="my-4">
					<h2 className="font-semibold text-lg my-4">Password</h2>
					<div className="space-y-4">
						<Input
							label="Current Password"
							errorMessage={passwordError.currentPassword}
							id="currentPassword"
							name="currentPassword"
							placeholder="Current Password"
							type="password"
							value={password.currentPassword}
							onChange={(e) =>
								setPassword({
									...password,
									currentPassword: e.target.value,
								})
							}
						/>
						<Input
							label="New Password"
							errorMessage={passwordError.newPassword}
							id="newPassword"
							name="newPassword"
							placeholder="New Password"
							type="password"
							value={password.newPassword}
							onChange={(e) =>
								setPassword({
									...password,
									newPassword: e.target.value,
								})
							}
						/>
						<Input
							label="Confirm New Password"
							errorMessage={passwordError.confirmPassword}
							id="confirmPassword"
							name="confirmPassword"
							placeholder="Confirm New Password"
							type="password"
							value={password.confirmPassword}
							onChange={(e) =>
								setPassword({
									...password,
									confirmPassword: e.target.value,
								})
							}
						/>
					</div>
					<div className="w-full flex justify-end mt-4">
						<Button
							disabled={
								!password.currentPassword ||
								!password.newPassword
							}
							loading={passwordLoading}
						>
							Save Changes
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
