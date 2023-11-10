"use client";

import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const emptyFields = {
	email: "",
	password: "",
};

export default function SignIn() {
	const [userInfo, setUserInfo] = useState(emptyFields);
	const [error, setError] = useState(emptyFields);
	const [loading, setLoading] = useState(false);

	const signIn: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
	};

	return (
		<>
			<h1 className="font-bold text-2xl text-center min-w-full">
				Sign In
			</h1>
			<form onSubmit={signIn}>
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
				<Button className="w-full mt-6" loading={loading}>
					Sign In
				</Button>
				<p className="w-full text-center mt-2">
					Don't have an account?{" "}
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
