"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { api } from "~/trpc/react";
import { type UserResource } from "@clerk/types";
import { useRouter } from "next-nprogress-bar";

export default function ExampleAccountSetup() {
	const [settingUpProfile, setSettingUpProfile] = useState(true);
	const [clearingExistingData, setClearingExistingData] = useState(true);
	const [generatingDemoData, setGeneratingDemoData] = useState(true);
	const { user, isLoaded } = useUser();
	const isMounted = useRef(false);

	const router = useRouter();
	const { mutate: clearExistingData } =
		api.example.clearExistingData.useMutation({
			onSuccess: () => {
				setClearingExistingData(false);
				generateDemoData();
			},
			onError: (e) => {
				toast.error(e.message);
			},
		});
	const { mutate: generateDemoData } =
		api.example.generateDemoData.useMutation({
			onSuccess: () => {
				setGeneratingDemoData(false);
				router.replace("/");
			},
			onError: (e) => {
				toast.error(e.message);
			},
		});

	const steps = [
		{
			status: settingUpProfile,
			name: "Setting Up Profile",
		},
		{
			status: clearingExistingData,
			name: "Clearing Existing Data",
		},
		{
			status: generatingDemoData,
			name: "Generating Demo Data",
		},
	];

	useEffect(() => {
		if (!isLoaded || !user) return;
		if (!isMounted.current) {
			isMounted.current = true;
			async function setup(user: UserResource) {
				try {
					await user.update({
						username: "demo_account",
					});

					if (user.hasImage) {
						await user?.setProfileImage({
							file: null,
						});
					}

					await user.reload();
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
				}

				setSettingUpProfile(false);
				clearExistingData();
			}
			setup(user)
				.then(() => {
					return;
				})
				.catch((e) =>
					toast.error(
						e?.message ?? "Something went wrong. Please try again.",
					),
				);
		}
	}, [isLoaded, clearExistingData, user]);

	return (
		<div className="flex flex-col items-center gap-2 pt-2">
			{steps.map((s) => (
				<p className="flex items-center gap-2" key={s.name}>
					<span>
						{s.status ? (
							<LoadingSpinner className="w-4 h-4" />
						) : (
							<FaCheck className="text-green-500" />
						)}
					</span>
					{s.name}
				</p>
			))}
		</div>
	);
}
