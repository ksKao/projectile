import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

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
						sortOrder: sortOrder !== undefined ? sortOrder + 1 : 0,
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
								sortOrder: "asc",
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
				// check if user is member of project
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
					project.kanbanColumns[0].tasks?.[0]?.sortOrder;

				await ctx.db.tasks.create({
					data: {
						title: input.title,
						kanbanColumnId: input.kanbanColumnId,
						sortOrder: sortOrder !== undefined ? sortOrder + 1 : 0,
					},
				});
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
	sortColumn: protectedProcedure
		.input(
			z.object({
				projectId: z.string().uuid("Invalid project ID"),
				sortedColumns: z.array(
					z.object({
						id: z.string().uuid("Invalid column ID"),
						sortOrder: z
							.number()
							.min(0, "Sort order must not be negative")
							.int("Number must be an integer"),
					}),
				),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const project = await ctx.db.projects.findFirst({
					where: {
						id: input.projectId,
						members: {
							has: ctx.auth.userId,
						},
					},
				});

				if (!project)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message:
							"Project does not exist, or you do not have permission.",
					});

				const transaction = input.sortedColumns.map((c) =>
					ctx.db.kanbanColumns.update({
						where: {
							id: c.id,
						},
						data: {
							sortOrder: c.sortOrder,
						},
					}),
				);

				await ctx.db.$transaction(transaction, {
					isolationLevel:
						Prisma.TransactionIsolationLevel.Serializable,
				});
			} catch (e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
	updateTaskOrder: protectedProcedure
		.input(
			z.object({
				projectId: z.string().uuid("Invalid project ID"),
				tasks: z.array(
					z.object({
						id: z.string().uuid("Invalid task ID"),
						kanbanColumnId: z.string().uuid("Invalid column ID"),
						sortOrder: z
							.number()
							.min(0, "Sort order cannot be negative")
							.int("Sort order must be an integer"),
					}),
				),
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
				});

				if (!project)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message:
							"Project does not exist, or you do not have permission.",
					});

				const transaction = input.tasks.map((t) =>
					ctx.db.tasks.update({
						where: {
							id: t.id,
						},
						data: {
							kanbanColumnId: t.kanbanColumnId,
							sortOrder: t.sortOrder,
						},
					}),
				);

				await ctx.db.$transaction(transaction, {
					isolationLevel:
						Prisma.TransactionIsolationLevel.Serializable,
				});
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
	addMemberToTask: protectedProcedure
		.input(
			z.object({
				userId: z.string().min(1, "User ID is required"),
				taskId: z.string().uuid("Invalid task ID"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const task = await ctx.db.tasks.findFirst({
					include: {
						kanbanColumn: {
							select: {
								project: true,
							},
						},
					},
					where: {
						id: {
							equals: input.taskId,
						},
					},
				});

				if (!task)
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "This task does not exist",
					});
				else if (
					!task.kanbanColumn.project.members.includes(input.userId)
				)
					throw new TRPCError({
						code: "BAD_REQUEST",
						message:
							"The member you are trying to add does not belong to this project",
					});
				else if (
					!task.kanbanColumn.project.members.includes(ctx.auth.userId)
				)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "You are not authorized to modify this task",
					});
				else if (task.assignedMembers.includes(input.userId))
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "This member is already assigned to the task",
					});

				await ctx.db.tasks.update({
					data: {
						assignedMembers: {
							push: input.userId,
						},
					},
					where: {
						id: input.taskId,
					},
				});
			} catch (e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
});
