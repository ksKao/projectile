"use client";
import { useSignIn } from "@clerk/nextjs";
import { Label } from "@radix-ui/react-label";
import { FormEventHandler, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { passwordResetSchema } from "~/lib/schema";
import { useRouter } from "next/navigation";

const emptyErrorObject = {
	email: "",
	code: "",
	password: "",
};

export default function PasswordResetForm() {
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(emptyErrorObject);
	const [loading, setLoading] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const { signIn, setActive } = useSignIn();
	const router = useRouter();

	const handleSendPasswordResetCode: React.FormEventHandler<
		HTMLFormElement
	> = async (e) => {
		e.preventDefault();

		setLoading(true);
		setError(emptyErrorObject);

		const result = z
			.string()
			.min(1, "Email is required")
			.email("Invalid email")
			.safeParse(email);

		if (!result.success) {
			setError({
				email: result.error.flatten().formErrors?.[0] ?? "",
				password: "",
				code: "",
			});
			setLoading(false);
			return;
		}

		try {
			await signIn?.create({
				strategy: "reset_password_email_code",
				identifier: email,
			});

			toast.success(
				"A password reset email has been sent to your email. Please check the code.",
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

	const handleResetPassword: FormEventHandler<HTMLFormElement> = async (
		e,
	) => {
		e.preventDefault();

		setLoading(true);
		setError(emptyErrorObject);

		const result = passwordResetSchema.safeParse({
			code,
			password,
		});

		if (!result.success) {
			const error = result.error.flatten().fieldErrors;
			setError({
				email: "",
				code: error.code?.[0] ?? "",
				password: error.password?.[0] ?? "",
			});
			setLoading(false);
			return;
		}

		try {
			const result = await signIn?.attemptFirstFactor({
				strategy: "reset_password_email_code",
				code,
				password,
			});

			if (result?.status === "complete") {
				setActive?.({ session: result.createdSessionId });
				toast.success("Your password has been reset");
				router.replace("/");
			} else {
				throw new Error("Something went wrong. Please try again");
			}
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
		return (
			<>
				<h1 className="font-bold text-2xl text-center min-w-full">
					Password Reset
				</h1>
				<form onSubmit={handleResetPassword}>
					<Label htmlFor="code">Code</Label>
					<Input
						type="number"
						id="code"
						placeholder="Code"
						value={code}
						errorMessage={error.code}
						onChange={(e) => {
							setCode(e.target.value);
						}}
					/>
					<Label htmlFor="password">New Password</Label>
					<Input
						type="password"
						id="password"
						placeholder="New Password"
						value={password}
						errorMessage={error.password}
						onChange={(e) => {
							setPassword(e.target.value);
						}}
					/>
					<Button className="w-full mt-6" loading={loading}>
						Reset Password
					</Button>
				</form>
			</>
		);
	}

	return (
		<>
			<h1 className="font-bold text-2xl text-center min-w-full">
				Password Reset
			</h1>
			<div className="h-4" />
			<form onSubmit={handleSendPasswordResetCode}>
				<Label htmlFor="email">Email</Label>
				<Input
					type="text"
					id="email"
					placeholder="Email"
					value={email}
					errorMessage={error.email}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
				/>
				<Button className="w-full mt-6" loading={loading}>
					Send Password Reset Code
				</Button>
			</form>
		</>
	);
}
