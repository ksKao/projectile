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

				const sortOrder = project?.kanbanColumns?.[0]?.sortOrder;

				if (!project)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message:
							"Project does not exist, or you do not have permission.",
					});

				await ctx.db.kanbanColumns.create({
					data: {
						name: input.name,
						projectId: input.projectId,
						sortOrder: sortOrder ? sortOrder + 1 : 1,
					},
				});
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
	getColumns: protectedProcedure
		.input(z.string().uuid("Invalid project ID"))
		.query(async ({ input, ctx }) => {
			try {
				// check if user is member of group
				const project = await ctx.db.projects.findFirst({
					where: {
						id: input,
						members: {
							has: ctx.auth.userId,
						},
					},
					include: {
						kanbanColumns: {
							include: {
								tasks: {
									orderBy: {
										sortOrder: "asc",
									},
								},
							},
							orderBy: {
								sortOrder: "desc",
							},
						},
					},
				});

				if (!project)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message:
							"Project does not exist, or you do not have permission.",
					});

				return project.kanbanColumns;
			} catch (e) {
				console.log("Message: ", e);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later",
				});
			}
		}),
	addTask: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid("Invalid card ID"),
				title: z.string().min(1, "Card title is required"),
				projectId: z.string().uuid("Invalid project ID"),
				kanbanColumnId: z.string().uuid("Invalid Kanban column ID"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			try {
				// check if user is member of group
				const project = await ctx.db.projects.findFirst({
					where: {
						id: {
							equals: input.projectId,
						},
						members: {
							has: ctx.auth.userId,
						},
					},
					include: {
						kanbanColumns: {
							where: {
								id: input.kanbanColumnId,
							},
							include: {
								tasks: {
									orderBy: {
										sortOrder: "desc",
									},
								},
							},
						},
					},
				});

				if (!project)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message:
							"Project does not exist, or you do not have permission.",
					});

				if (!project.kanbanColumns?.[0])
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Kanban column does not exist.",
					});

				const sortOrder =
					(project.kanbanColumns[0].tasks?.[0]?.sortOrder ?? 0) + 1;

				await ctx.db.tasks.create({
					data: {
						title: input.title,
						kanbanColumnId: input.kanbanColumnId,
						sortOrder,
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
