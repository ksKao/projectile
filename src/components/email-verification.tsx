"use client";

import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function EmailVerification({
	signUp,
	setActive,
}: {
	signUp: ReturnType<typeof useSignUp>["signUp"];
	setActive: ReturnType<typeof useSignUp>["setActive"];
}) {
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleCode: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();

		setLoading(true);

		try {
			const completeSignUp =
				await signUp?.attemptEmailAddressVerification({
					code,
				});

			if (completeSignUp?.status === "complete") {
				await setActive?.({
					session: completeSignUp.createdSessionId,
				});
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

	return (
		<>
			<h1 className="font-bold text-2xl text-center min-w-full">
				Email Verification
			</h1>
			<div className="h-4" />
			<form onSubmit={handleCode}>
				<Label htmlFor="username">Email Verification Code</Label>
				<Input
					type="number"
					id="code"
					placeholder="Email Verification Code"
					value={code}
					onChange={(e) => {
						setCode(e.target.value);
					}}
				/>
				<Button loading={loading} className="w-full mt-4">
					Verify
				</Button>
			</form>
		</>
	);
}
