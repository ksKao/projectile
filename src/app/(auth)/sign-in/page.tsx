"use client";

import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next-nprogress-bar";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { signInSchema } from "~/lib/schema";
import { env } from "~/env.mjs";

const emptyFields = {
	email: "",
	password: "",
};

export default function SignIn() {
	const [userInfo, setUserInfo] = useState(emptyFields);
	const [error, setError] = useState(emptyFields);
	const [loading, setLoading] = useState(false);
	const { signIn, setActive } = useSignIn();
	const router = useRouter();

	const handleSignIn: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(emptyFields);

		const result = signInSchema.safeParse(userInfo);

		if (!result.success) {
			const error = result.error.flatten().fieldErrors;
			setError({
				email: error.email?.[0] ?? "",
				password: error.password?.[0] ?? "",
			});
			setLoading(false);
			return;
		}

		try {
			const result = await signIn?.create({
				identifier: userInfo.email,
				password: userInfo.password,
			});

			if (result?.status === "complete") {
				await setActive?.({ session: result.createdSessionId });
				router.replace("/");
			}
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
			setLoading(false);
		}
	};

	const handleExampleSignIn = async () => {
		setLoading(true);

		try {
			const result = await signIn?.create({
				identifier: env.NEXT_PUBLIC_EXAMPLE_ACCOUNT_EMAIL,
				password: env.NEXT_PUBLIC_EXAMPLE_ACCOUNT_PASSWORD,
			});

			if (result?.status === "complete") {
				await setActive?.({ session: result.createdSessionId });
				router.replace("/example");
			}
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
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="font-bold text-2xl text-center min-w-full">
				Sign In
			</h1>
			<div className="h-4" />
			<form onSubmit={handleSignIn}>
				<Input
					type="text"
					inputMode="email"
					id="email"
					placeholder="Email"
					label="Email"
					value={userInfo.email}
					errorMessage={error.email}
					onChange={(e) => {
						setUserInfo({
							...userInfo,
							email: e.target.value,
						});
					}}
				/>
				<div className="relative">
					<Input
						type="password"
						id="password"
						placeholder="Password"
						label="Password"
						value={userInfo.password}
						errorMessage={error.password}
						onChange={(e) => {
							setUserInfo({
								...userInfo,
								password: e.target.value,
							});
						}}
					/>
					<Link
						href="/password-reset"
						className="absolute right-0 bottom-0 hover:underline text-primary text-sm"
					>
						Forgot password
					</Link>
				</div>
				<Button className="w-full mt-6" loading={loading}>
					Sign In
				</Button>
				<Button
					className="w-full mt-2"
					variant="outline"
					loading={loading}
					type="button"
					onClick={handleExampleSignIn}
				>
					Sign In with Example Account
				</Button>
				<p className="w-full text-center mt-2">
					Don&apos;t have an account?{" "}
					<Link
						href="/sign-up"
						className="text-primary hover:underline"
					>
						Sign up here.
					</Link>
				</p>
			</form>
		</>
	);
}
