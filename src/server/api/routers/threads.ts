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
});
