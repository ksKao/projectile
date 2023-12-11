import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const threadsRouter = createTRPCRouter({
	createThread: protectedProcedure
		.input(
			z.object({
				projectId: z.string().uuid("Invalid project ID"),
				title: z
					.string()
					.min(1, "Thread title is required")
					.max(
						100,
						"Thread title cannot be longer than 100 characters",
					),
				content: z.string(),
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

			if (!project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only members of this project can post a thread.",
				});

			try {
				await ctx.db.threads.create({
					data: {
						...input,
						author: ctx.auth.userId,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}
		}),
	getThreads: protectedProcedure
		.input(z.string().uuid("Invalid project ID"))
		.query(async ({ input, ctx }) => {
			let threads;
			try {
				threads = await ctx.db.threads.findMany({
					where: {
						projectId: input,
					},
					include: {
						project: true,
						replies: {
							select: {
								id: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			const threadWithNumberOfReplies = threads.map((thread) => {
				const { replies, ...restThread } = thread;
				return {
					...restThread,
					numberOfReplies: replies.length,
				};
			});

			if (threads.length === 0) return threadWithNumberOfReplies;

			if (!threads[0]?.project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"Only members of this project can view these threads",
				});

			return threadWithNumberOfReplies;
		}),
	getThread: protectedProcedure
		.input(z.string().uuid("Invalid thread ID"))
		.query(async ({ input, ctx }) => {
			let thread;

			try {
				thread = await ctx.db.threads.findFirst({
					where: {
						id: {
							equals: input,
						},
					},
					include: {
						replies: {
							orderBy: {
								createdAt: "desc",
							},
						},
						project: true,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!thread)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Thread does not exist.",
				});

			if (!thread.project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"Only members of this project can view this thread.",
				});

			return thread;
		}),
	createReply: protectedProcedure
		.input(
			z.object({
				threadId: z.string().uuid("Invalid thread ID"),
				content: z.string().min(1, "Content is required"),
				parentId: z
					.string()
					.uuid("Invalid parent comment ID")
					.nullable(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			let thread;
			try {
				thread = await ctx.db.threads.findFirst({
					where: {
						id: input.threadId,
					},
					include: {
						project: true,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!thread)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Thread does not exist",
				});

			if (!thread.project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only members of this project can post a reply",
				});

			try {
				await ctx.db.threadReplies.create({
					data: {
						...input,
						author: ctx.auth.userId,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}
		}),
});
