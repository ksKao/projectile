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
					project: {
						...restThread.project,
						password:
							restThread.project.leader === ctx.auth.userId
								? restThread.project.password
								: "",
					},
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
								updatedAt: "desc",
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

			return {
				...thread,
				project: {
					...thread.project,
					password:
						thread.project.leader === ctx.auth.userId
							? thread.project.password
							: "",
				},
			};
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

			// only allow max 5 depths of reply chain
			async function isReplyChainTooDeep(replyId: string, depth = 1) {
				if (depth >= 5) {
					// The reply chain is too deep
					return true;
				}

				const reply = await ctx.db.threadReplies.findUnique({
					where: { id: replyId },
					include: { parent: true },
				});

				if (!reply) {
					// Comment not found
					return false;
				}

				if (reply.parentId && reply.parentId !== null)
					return isReplyChainTooDeep(reply.parentId, depth + 1);

				return false;
			}

			if (input.parentId && (await isReplyChainTooDeep(input.parentId))) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Reply chain is too deep.",
				});
			}

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
	updateReply: protectedProcedure
		.input(
			z.object({
				replyId: z.string().uuid("Invalid thread ID"),
				content: z.string().min(1, "Content is required"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			let threadReply;

			try {
				threadReply = await ctx.db.threadReplies.findFirst({
					where: {
						id: input.replyId,
					},
					include: {
						thread: {
							include: {
								project: true,
							},
						},
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!threadReply)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Thread does not exist",
				});

			// membership of project is still checked because we don't want kicked members to be able to modify reply
			if (!threadReply.thread.project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only members of this group can edit reply",
				});

			if (threadReply.author !== ctx.auth.userId)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only author of this reply can edit.",
				});

			try {
				await ctx.db.threadReplies.update({
					data: {
						content: input.content,
					},
					where: {
						id: input.replyId,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}
		}),
	deleteReply: protectedProcedure
		.input(z.string())
		.mutation(async ({ input, ctx }) => {
			let threadReply;
			try {
				threadReply = await ctx.db.threadReplies.findFirst({
					where: {
						id: input,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!threadReply)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Reply is not found.",
				});

			if (threadReply.author !== ctx.auth.userId)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only the author of this reply can delete this.",
				});

			await ctx.db.threadReplies.update({
				data: {
					deleted: true,
					content: "",
					updatedAt: threadReply.updatedAt, // keep updated at to avoid it being sorted at the top
				},
				where: {
					id: input,
				},
			});
		}),
	editThread: protectedProcedure
		.input(
			z.object({
				threadId: z.string().uuid("Invalid thread ID"),
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
					message: "Thread does not exist.",
				});

			// check needed to prevent kicked members from editing existing thread
			if (!thread.project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"Only members of this project can edit this thread.",
				});

			if (thread.author !== ctx.auth.userId)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only the author of this thread can edit this.",
				});

			try {
				await ctx.db.threads.update({
					data: {
						title: input.title,
						content: input.content,
					},
					where: {
						id: input.threadId,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}
		}),
	deleteThread: protectedProcedure
		.input(z.string().uuid("Invalid thread ID"))
		.mutation(async ({ input, ctx }) => {
			let thread;
			try {
				thread = await ctx.db.threads.findFirst({
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

			if (!thread)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Thread is not found.",
				});

			// if user is not author nor leader
			if (
				thread.author !== ctx.auth.userId &&
				thread.project.leader !== ctx.auth.userId
			)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"You must be the author or the project leader to delete this thread.",
				});

			try {
				await ctx.db.threads.delete({
					where: {
						id: input,
					},
				});
			} catch {
				throw ctx.internalServerError;
			}
		}),
});
