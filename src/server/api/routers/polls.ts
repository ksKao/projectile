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
					.max(10, "A poll cannot have more than 10 options"),
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
					data: input.options.map((o) => {
						return {
							title: o,
							pollsId: poll.id,
						};
					}),
				});
			});
		}),
});
