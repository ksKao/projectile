import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProjectSchema } from "~/lib/schema";
import { generatePassword } from "~/lib/utils";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/supabase";

export const projectRouter = createTRPCRouter({
	createProject: protectedProcedure
		.input(createProjectSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const imageExtension = input.image.split(".").pop();

				const project = await ctx.db.projects.create({
					data: {
						name: input.name,
						description: input.description,
						dueDate: input.dueDate,
						thumbnailFileName: `thumbnail.${imageExtension}`,
						password: generatePassword(),
						leader: ctx.auth.userId,
						members: [ctx.auth.userId],
					},
				});

				const { data, error } = await supabase.storage
					.from("projects")
					.createSignedUploadUrl(
						`${project.id}/${project.thumbnailFileName}`,
					);

				if (error)
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: error.message,
					});

				return {
					...data,
					projectId: project.id,
				};
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
	deleteProject: protectedProcedure
		.input(z.string().uuid("Invalid project ID."))
		.mutation(async ({ ctx, input }) => {
			// check if user is group leader
			const project = await ctx.db.projects.findFirst({
				where: {
					id: {
						equals: input,
					},
				},
			});

			if (!project)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project does not exist.",
				});

			if (project.leader !== ctx.auth.userId)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only group leader can delete the project",
				});

			await ctx.db.projects.delete({
				where: {
					id: input,
				},
			});
		}),
	getAllProjects: protectedProcedure.query(async ({ ctx }) => {
		try {
			const projects = await ctx.db.projects.findMany({
				where: {
					members: {
						has: ctx.auth.userId,
					},
				},
				orderBy: {
					dueDate: "asc",
				},
			});

			if (projects.length <= 0)
				return projects.map((p) => {
					return {
						...p,
						members: [] as {
							userId: string;
							imageUrl: string;
						}[],
						thumbnailUrl: "",
					};
				});

			const members: string[] = [];

			// get a list of member id
			for (const project of projects) {
				for (const memberId of project.members) {
					if (!members.includes(memberId)) {
						members.push(memberId);
					}
				}
			}

			// use the member id to get a list of users from clerk
			const memberInfos = (
				await clerkClient.users.getUserList({
					userId: members,
				})
			).map((user) => {
				return {
					userId: user.id,
					imageUrl: user.imageUrl,
				};
			});

			const res = await supabase.storage
				.from("projects")
				.createSignedUrls(
					projects.map((p) => `${p.id}/${p.thumbnailFileName}`),
					60,
				);

			if (res.error) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: res.error.message,
				});
			}

			return projects.map((p, i) => {
				return {
					...p,
					members: p.members.map((member) =>
						memberInfos.find((m) => m.userId === member),
					),
					thumbnailUrl: res.data?.[i]?.signedUrl ?? "",
				};
			});
		} catch {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Something went wrong. Please try again later.",
			});
		}
	}),
	getProject: protectedProcedure
		.input(z.string())
		.query(async ({ input, ctx }) => {
			try {
				const project = await ctx.db.projects.findFirst({
					where: {
						id: {
							equals: input,
						},
						members: {
							has: ctx.auth.userId,
						},
					},
				});

				if (!project) return null;

				const userList = (
					await clerkClient.users.getUserList({
						userId: project.members,
					})
				).map((u) => {
					return {
						id: u.id,
						username: u.username,
						imageUrl: u.imageUrl,
					};
				});

				const res = await supabase.storage
					.from("projects")
					.createSignedUrl(
						`${project.id}/${project.thumbnailFileName}`,
						60,
					);

				if (res.error)
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: res.error.message,
					});

				const thumbnailUrl = res.data.signedUrl;

				return {
					...project,
					members: userList,
					thumbnailUrl,
				};
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
});
