"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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

	const signUp: React.FormEventHandler<HTMLFormElement> = async (e) => {
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

		setLoading(false);
	};

	return (
		<>
			<h1 className="font-bold text-2xl text-center min-w-full">
				Sign Up
			</h1>
			<form onSubmit={signUp}>
				<Label htmlFor="username">Username</Label>
				<Input
					type="text"
					id="username"
					placeholder="Username"
					value={userInfo.username}
					errorMessage={error.username}
					onChange={(e) =>
						setUserInfo({
							...userInfo,
							username: e.target.value,
						})
					}
				/>
				<div className="h-4" />
				<Label htmlFor="email">Email</Label>
				<Input
					type="text"
					id="email"
					placeholder="Email"
					value={userInfo.email}
					errorMessage={error.email}
					onChange={(e) => {
						setUserInfo({
							...userInfo,
							email: e.target.value,
						});
					}}
				/>
				<div className="h-4" />
				<Label htmlFor="password">Password</Label>
				<Input
					type="password"
					id="password"
					placeholder="Password"
					value={userInfo.password}
					errorMessage={error.password}
					onChange={(e) => {
						setUserInfo({
							...userInfo,
							password: e.target.value,
						});
					}}
				/>
				<div className="h-4" />
				<Label htmlFor="confirmPassword">Confirm Password</Label>
				<Input
					type="password"
					id="confirmPassword"
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
