import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { type Projects } from "@prisma/client";

export const pollsRouter = createTRPCRouter({
	createPoll: protectedProcedure
		.input(
			z.object({
				projectId: z.string().uuid("Invalid Project ID"),
				title: z
					.string()
					.min(1, "Poll title is required")
					.max(
						100,
						"Poll title cannot be longer than 100 characters",
					),
				options: z
					.array(
						z
							.string()
							.min(1, "Option cannot be empty")
							.max(
								50,
								"Option cannot be longer than 50 characters",
							),
					)
					.min(2, "A poll must have at least 2 options")
					.max(5, "A poll cannot have more than 5 options"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			let project: Projects | null;
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
					message: "Only members of this group can create a poll",
				});

			await ctx.db.$transaction(async (t) => {
				if (!project) throw new Error();

				const poll = await t.polls.create({
					data: {
						title: input.title,
						projectId: project.id,
					},
				});

				await t.pollOptions.createMany({
					data: input.options.map((o, i) => {
						return {
							title: o,
							pollsId: poll.id,
							sortOrder: i,
						};
					}),
				});
			});
		}),
	getPolls: protectedProcedure
		.input(z.string().uuid("Invalid project ID"))
		.query(async ({ input, ctx }) => {
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
					message: "Project not found.",
				});

			if (!project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only members of this project can view polls.",
				});

			try {
				return await ctx.db.polls.findMany({
					where: {
						projectId: input,
					},
					include: {
						options: {
							orderBy: {
								sortOrder: "asc",
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
		}),
	vote: protectedProcedure
		.input(z.string().uuid("Invalid option ID"))
		.mutation(async ({ input, ctx }) => {
			let option;
			try {
				option = await ctx.db.pollOptions.findFirst({
					where: { id: input },
					include: {
						poll: {
							include: {
								project: true,
								options: true,
							},
						},
					},
				});
			} catch {
				throw ctx.internalServerError;
			}

			if (!option)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Option does not exist",
				});

			if (!option.poll.project.members.includes(ctx.auth.userId))
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only members of this group can vote.",
				});

			const votedOptions = option.poll.options.filter((o) =>
				o.votedBy.includes(ctx.auth.userId),
			);

			try {
				const data = await ctx.db.$transaction(
					async (transaction) => {
						// if user has voted on another option, remove their vote on that option
						if (votedOptions.length > 0) {
							for (const option of votedOptions) {
								await transaction.pollOptions.update({
									where: {
										id: option.id,
									},
									data: {
										votedBy: {
											set: option.votedBy.filter(
												(member) =>
													member !== ctx.auth.userId,
											),
										},
									},
								});
							}
						}

						return await transaction.pollOptions.update({
							where: {
								id: input,
							},
							data: {
								votedBy: {
									push: ctx.auth.userId,
								},
							},
							include: {
								poll: {
									include: {
										options: {
											orderBy: {
												sortOrder: "asc",
											},
										},
									},
								},
							},
						});
					},
					{
						isolationLevel: "Serializable",
					},
				);

				return data.poll;
			} catch {
				throw ctx.internalServerError;
			}
		}),
});
