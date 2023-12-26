import { clerkClient } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProjectSchema } from "~/lib/schema";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/supabase";

export const projectRouter = createTRPCRouter({
	createProject: protectedProcedure
		.input(createProjectSchema)
		.mutation(async ({ input, ctx }) => {
			let project;

			try {
				project = await ctx.db.projects.create({
					data: {
						name: input.name,
						description: input.description,
						dueDate: input.dueDate,
						leader: ctx.auth.userId,
						password: createId(),
						members: [ctx.auth.userId],
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			let res;
			try {
				res = await supabase.storage
					.from("projects")
					.createSignedUploadUrl(`${project.id}/thumbnail`);
			} catch {
				throw ctx.internalServerError;
			}

			if (res.error)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: res.error.message,
				});
			return {
				...res.data,
				projectId: project.id,
			};
		}),
	deleteProject: protectedProcedure
		.input(z.string().uuid("Invalid project ID."))
		.mutation(async ({ ctx, input }) => {
			let project;
			try {
				project = await ctx.db.projects.findFirst({
					where: {
						id: {
							equals: input,
						},
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!project)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project does not exist.",
				});

			// check if user is group leader
			if (project.leader !== ctx.auth.userId)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only group leader can delete the project",
				});

			try {
				await ctx.db.projects.delete({
					where: {
						id: input,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			let res;
			try {
				res = await supabase.storage
					.from("projects")
					.list(`${project.id}/files`);
				if (res.error) throw new Error(res.error.message);

				const projectId = project.id;

				res = await supabase.storage
					.from("projects")
					.remove([
						...res.data.map((f) => `${projectId}/files/${f.name}`),
						`${projectId}/thumbnail`,
					]);

				if (res.error) throw new Error(res.error.message);
			} catch (e) {
				if (e instanceof Error)
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: e.message,
					});
				throw ctx.internalServerError;
			}
		}),
	getAllProjects: protectedProcedure.query(async ({ ctx }) => {
		let projects;
		try {
			projects = await ctx.db.projects.findMany({
				where: {
					members: {
						has: ctx.auth.userId,
					},
				},
				orderBy: {
					dueDate: "asc",
				},
			});
		} catch {
			throw ctx.internalServerError;
		}

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

		try {
			const res = await supabase.storage
				.from("projects")
				.createSignedUrls(
					projects.map((p) => `${p.id}/thumbnail`),
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
		} catch (e) {
			if (e instanceof TRPCError) throw new TRPCError(e);
			throw ctx.internalServerError;
		}
	}),
	getProject: protectedProcedure
		.input(z.string())
		.query(async ({ input, ctx }) => {
			let project;
			try {
				project = await ctx.db.projects.findFirst({
					where: {
						id: {
							equals: input,
						},
						members: {
							has: ctx.auth.userId,
						},
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!project) return null;

			let userList;
			try {
				userList = (
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
			} catch {
				throw ctx.internalServerError;
			}

			let res;
			try {
				res = await supabase.storage
					.from("projects")
					.createSignedUrl(`${project.id}/thumbnail`, 60);
			} catch {
				throw ctx.internalServerError;
			}

			const thumbnailUrl = res.error ? "" : res.data.signedUrl;

			return {
				...project,
				members: userList,
				thumbnailUrl,
			};
		}),
	reassignLeader: protectedProcedure
		.input(
			z.object({
				projectId: z.string().uuid("Invalid project ID"),
				newLeaderId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// if new leader is the same as the current leader, return
			if (input.newLeaderId === ctx.auth.userId) return;

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
					message: "Project does not exist.",
				});

			if (project.leader !== ctx.auth.userId)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only group leader can transfer leadership.",
				});

			try {
				await ctx.db.projects.update({
					data: {
						leader: input.newLeaderId,
					},
					where: {
						id: input.projectId,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}
		}),
	removeMember: protectedProcedure
		.input(
			z.object({
				projectId: z.string().uuid("Invalid project ID"),
				removeMemberId: z.string(),
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
					message: "Project does not exist.",
				});

			if (project.members.length <= 1)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"There must be at least one member in the group. Please delete the group instead.",
				});

			// if removed user is not this user and is not leader
			if (
				project.leader !== ctx.auth.userId &&
				input.removeMemberId !== ctx.auth.userId
			)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only project leader can remove other members",
				});

			const newMembers = project.members.filter(
				(m) => m !== input.removeMemberId,
			);
			const newLeader = newMembers.includes(project.leader)
				? project.leader
				: newMembers[0];

			try {
				await ctx.db.projects.update({
					data: {
						members: {
							set: newMembers,
						},
						leader: newLeader,
					},
					where: {
						id: input.projectId,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}
		}),
	updateProject: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid("Invalid project ID"),
				name: z
					.string()
					.min(1, "Project name is required")
					.max(
						255,
						"Project name cannot be longer than 255 characters.",
					)
					.nullish(),
				description: z.string().nullish(),
				dueDate: z.date().nullish(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			let project;
			try {
				project = await ctx.db.projects.findFirst({
					where: {
						id: input.id,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!project)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project does not exist.",
				});

			if (project.leader !== ctx.auth.userId)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only the project leader can update project",
				});

			try {
				await ctx.db.projects.update({
					where: {
						id: input.id,
					},
					data: {
						name: input.name ?? undefined,
						description:
							input.description === null ? "" : input.description,
						dueDate: input.dueDate ?? undefined,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}
		}),
	updateProjectThumbnail: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid("Invalid project ID"),
				newFileName: z.string().min(1, "Image name is required."),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			let project;
			try {
				project = await ctx.db.projects.findFirst({
					where: {
						id: input.id,
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

			if (project.leader !== ctx.auth.userId)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"Only the project leader can change the project thumbnail",
				});

			// create signed URL
			let res;
			try {
				// delete old file
				await supabase.storage
					.from("projects")
					.remove([`${project.id}/thumbnail`]);
				res = await supabase.storage
					.from("projects")
					.createSignedUploadUrl(`${project.id}/thumbnail`);
			} catch {
				throw ctx.internalServerError;
			}

			if (res.error)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: res.error.message,
				});

			return res.data;
		}),
	regeneratePassword: protectedProcedure
		.input(z.string().uuid("Invalid project ID"))
		.mutation(async ({ input, ctx }) => {
			let project;
			try {
				project = await ctx.db.projects.findFirst({
					where: {
						id: input,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!project)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project does not exist",
				});

			if (project.leader !== ctx.auth.userId)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"Only the project leader can regenerate the password",
				});

			try {
				const { password } = await ctx.db.projects.update({
					where: {
						id: input,
					},
					data: {
						password: createId(),
					},
					select: {
						password: true,
					},
				});
				return password;
			} catch {
				throw ctx.internalServerError;
			}
		}),
});
