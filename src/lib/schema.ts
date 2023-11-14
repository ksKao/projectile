import { z } from "zod";

export const signUpSchema = z
	.object({
		username: z.string().min(1, { message: "Username is required" }),
		email: z
			.string()
			.min(1, { message: "Email is required" })
			.email({ message: "Invalid email" }),
		password: z
			.string()
			.min(1, { message: "Password is required" })
			.min(8, { message: "Password must be at least 8 characters" }),
		confirmPassword: z
			.string()
			.min(1, { message: "Confirm password is required" }),
	})
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (password !== confirmPassword) {
			ctx.addIssue({
				code: "custom",
				message: "Passwords do not match",
				path: ["password"],
			});
			ctx.addIssue({
				code: "custom",
				message: "Passwords do not match",
				path: ["confirmPassword"],
			});
		}
	});

export const signInSchema = z.object({
	email: z
		.string()
		.min(1, { message: "Email is required" })
		.email({ message: "Invalid email" }),
	password: z.string().min(1, { message: "Password is required" }),
});

export const passwordResetSchema = z.object({
	code: z.string().min(1, "Code is required"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(8, "Password must be at least 8 characters"),
});
