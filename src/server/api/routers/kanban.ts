import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const kanbanRouter = createTRPCRouter({
	addColumn: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "Column name is required."),
				projectId: z.string().uuid("Invalid project ID"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			try {
				// check if user is member of group
				const project = await ctx.db.projects.findFirst({
					where: {
						id: input.projectId,
						members: {
							has: ctx.auth.userId,
						},
					},
					include: {
						kanbanColumns: {
							orderBy: {
								sortOrder: "desc",
							},
							take: 1,
						},
					},
				});

				const sortOrder = project?.kanbanColumns?.[0]?.sortOrder as
					| number
					| undefined;

				if (!project)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message:
							"Only member of this project can add a new column",
					});

				await ctx.db.kanbanColumns.create({
					data: {
						name: input.name,
						projectId: input.projectId,
						sortOrder: sortOrder ?? 1,
					},
				});
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
});
