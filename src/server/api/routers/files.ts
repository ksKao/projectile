import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { supabase } from "~/server/supabase";
import { TRPCError } from "@trpc/server";

export const filesRouter = createTRPCRouter({
	uploadFile: protectedProcedure
		.input(
			z.object({
				projectId: z.string().uuid("Invalid project ID"),
				fileName: z
					.string()
					.min(1, "File name is required")
					.max(100, "File name cannot be longer than 100 characters"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			let project;
			try {
				project = await ctx.db.projects.findFirst({
					where: {
						id: input.projectId,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!project)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project is not found",
				});

			if (!project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only members of this project can upload files.",
				});

			let existingFile;
			try {
				existingFile = await ctx.db.files.findFirst({
					where: {
						projectId: project.id,
						fileName: input.fileName,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			let newFileName = input.fileName;

			if (existingFile) {
				const dotIndex = input.fileName.lastIndexOf(".");
				if (dotIndex !== -1) {
					newFileName =
						input.fileName.slice(0, dotIndex) +
						" (copy)" +
						input.fileName.slice(dotIndex);
				} else {
					newFileName = input.fileName + " (copy)";
				}
			}

			let createdFile;
			try {
				createdFile = await ctx.db.files.create({
					data: {
						projectId: input.projectId,
						fileName: newFileName,
						uploadedBy: ctx.auth.userId,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			let res;
			try {
				res = await supabase.storage
					.from("projects")
					.createSignedUploadUrl(
						`${project.id}/files/${createdFile.id}`,
					);
			} catch {
				await ctx.db.files.delete({
					where: {
						id: createdFile.id,
					},
				});
				throw ctx.internalServerError;
			}

			if (res.error) {
				await ctx.db.files.delete({
					where: {
						id: createdFile.id,
					},
				});
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: res.error.message,
				});
			}

			return { ...res.data, fileId: createdFile.id };
		}),
	deleteFile: protectedProcedure
		.input(z.string().uuid("Invalid file ID"))
		.mutation(async ({ input, ctx }) => {
			let file;

			try {
				file = await ctx.db.files.findFirst({
					where: {
						id: input,
					},
					include: {
						project: true,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!file)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "File is not found",
				});

			if (!file.project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only members of this group can delete this file",
				});

			try {
				await ctx.db.files.delete({
					where: {
						id: file.id,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			let res;
			try {
				res = await supabase.storage
					.from("projects")
					.remove([`${file.projectId}/files/${file.id}`]);
			} catch {
				throw ctx.internalServerError;
			}

			if (res.error)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: res.error.message,
				});
		}),
	getFiles: protectedProcedure
		.input(z.string().uuid("Invalid project ID"))
		.query(async ({ input, ctx }) => {
			let files;

			try {
				files = await ctx.db.files.findMany({
					where: {
						projectId: input,
					},
					include: {
						project: true,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!files[0])
				return files.map((f) => {
					return {
						...f,
						downloadUrl: "",
					};
				});

			const project = files[0].project;

			if (!project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"Only members of this project can view these files.",
				});

			let res;
			try {
				res = await supabase.storage.from("projects").createSignedUrls(
					files.map((f) => `${f.projectId}/files/${f.id}`),
					60,
					{
						download: true,
					},
				);
			} catch {
				throw ctx.internalServerError;
			}

			if (res.error)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: res.error.message,
				});

			const signedUrls = res.data.map((r) => r.signedUrl);

			return files.map((f, i) => {
				return {
					...f,
					downloadUrl: signedUrls[i] ?? "",
				};
			});
		}),
});
