"use client";
import { useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import EmailVerification from "./email-verification";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { signUpSchema } from "~/lib/schema";

const emptyFields = {
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
};

export default function SignUp() {
	const [userInfo, setUserInfo] = useState(emptyFields);
	const [error, setError] = useState(emptyFields);
	const [loading, setLoading] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const { signUp, setActive } = useSignUp();

	const handleSignUp: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();

		setLoading(true);
		setError(emptyFields);

		const result = signUpSchema.safeParse(userInfo);

		if (!result.success) {
			const error = result.error.flatten().fieldErrors;
			setError({
				username: error.username?.[0] ?? "",
				email: error.email?.[0] ?? "",
				password: error.password?.[0] ?? "",
				confirmPassword: error.confirmPassword?.[0] ?? "",
			});
			setLoading(false);
			return;
		}

		try {
			await signUp?.create({
				username: userInfo.username,
				emailAddress: userInfo.email,
				password: userInfo.password,
			});

			// send verification email
			await signUp?.prepareEmailAddressVerification({
				strategy: "email_code",
			});

			toast.success(
				"Email registered. Check your email for the verification code.",
			);
			setVerifying(true);
		} catch (e: any) {
			if (e.errors?.[0]?.longMessage) {
				toast.error(e.errors[0].longMessage);
			} else if (e instanceof Error) {
				toast.error(e.message);
			} else {
				toast.error("Something went wrong. Please try again");
			}
		} finally {
			setLoading(false);
		}
	};

	if (verifying) {
		return <EmailVerification signUp={signUp} setActive={setActive} />;
	}

	return (
		<>
			<h1 className="font-bold text-2xl text-center min-w-full">
				Sign Up
			</h1>
			<div className="h-4" />
			<form onSubmit={handleSignUp}>
				<Input
					type="text"
					id="username"
					placeholder="Username"
					label="Username"
					value={userInfo.username}
					errorMessage={error.username}
					onChange={(e) =>
						setUserInfo({
							...userInfo,
							username: e.target.value,
						})
					}
				/>
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
				<Input
					type="password"
					id="confirmPassword"
					label="Confirm Password"
					placeholder="Confirm Password"
					value={userInfo.confirmPassword}
					errorMessage={error.confirmPassword}
					onChange={(e) => {
						setUserInfo({
							...userInfo,
							confirmPassword: e.target.value,
						});
					}}
				/>
				<Button className="w-full mt-6" loading={loading}>
					Sign Up
				</Button>
				<p className="w-full text-center mt-2">
					Already have an account?{" "}
					<Link
						href="/sign-in"
						className="text-primary hover:underline"
					>
						Sign in here.
					</Link>
				</p>
			</form>
		</>
	);
}
