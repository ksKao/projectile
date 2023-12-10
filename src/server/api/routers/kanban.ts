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
	deleteColumn: protectedProcedure
		.input(z.string().uuid("Invalid column ID"))
		.mutation(async ({ input, ctx }) => {
			try {
				// check if user is member of project
				const column = await ctx.db.kanbanColumns.findFirst({
					where: {
						id: input,
					},
					include: {
						project: true,
					},
				});

				if (!column)
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Invalid column ID",
					});

				if (!column.project.members.includes(ctx.auth.userId))
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "You do not have permission to delete column",
					});

				await ctx.db.kanbanColumns.delete({
					where: {
						id: input,
					},
				});
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
	changeColumnName: protectedProcedure
		.input(
			z.object({
				columnId: z.string().uuid("Invalid column ID"),
				name: z.string().min(1, "Column name is required"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			try {
				// check if user is member of project
				const column = await ctx.db.kanbanColumns.findFirst({
					where: {
						id: input.columnId,
					},
					include: {
						project: true,
					},
				});

				if (!column)
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Invalid column ID",
					});

				if (!column.project.members.includes(ctx.auth.userId))
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Not member of this project",
					});

				await ctx.db.kanbanColumns.update({
					data: {
						name: input.name,
					},
					where: {
						id: input.columnId,
					},
				});
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
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
	modifyTaskAssignedMember: protectedProcedure
		.input(
			z.object({
				userId: z.string().min(1, "User ID is required"),
				taskId: z.string().uuid("Invalid task ID"),
				action: z.enum(["add", "remove"], {
					invalid_type_error: "Invalid action",
					required_error: "Action is required",
				}),
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
				else if (
					input.action === "add" &&
					task.assignedMembers.includes(input.userId)
				)
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "This member is already assigned to the task",
					});
				else if (
					input.action === "remove" &&
					!task.assignedMembers.includes(input.userId)
				)
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "This member is not assigned to the task",
					});

				let newMembers = task.assignedMembers;

				if (input.action === "add") {
					newMembers.push(input.userId);
				} else {
					newMembers = newMembers.filter((m) => m !== input.userId);
				}

				await ctx.db.tasks.update({
					data: {
						assignedMembers: {
							set: newMembers,
						},
					},
					where: {
						id: input.taskId,
					},
				});

				return input.action === "add"
					? "Member added succesfully"
					: "Member removed successfully";
			} catch (e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
	modifyTaskDueDate: protectedProcedure
		.input(
			z.object({
				taskId: z.string().uuid("Invalid task ID"),
				dueDate: z
					.date({
						invalid_type_error: "Invalid date format",
					})
					.nullish(),
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

				if (
					!task.kanbanColumn.project.members.includes(ctx.auth.userId)
				)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "You are not authorized to modify this task",
					});

				await ctx.db.tasks.update({
					data: {
						dueDate: input.dueDate ?? null,
					},
					where: {
						id: input.taskId,
					},
				});
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
	modifyTaskDescription: protectedProcedure
		.input(
			z.object({
				taskId: z.string().uuid("Invalid task ID"),
				description: z.string(),
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
				if (
					!task.kanbanColumn.project.members.includes(ctx.auth.userId)
				)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "You are not authorized to modify this task",
					});

				await ctx.db.tasks.update({
					data: {
						description: input.description,
					},
					where: {
						id: input.taskId,
					},
				});

				return input.description;
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later",
				});
			}
		}),
	modifyTaskTitle: protectedProcedure
		.input(
			z.object({
				taskId: z.string().uuid("Invalid task ID"),
				title: z.string().min(1, "Task title is required"),
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
				if (
					!task.kanbanColumn.project.members.includes(ctx.auth.userId)
				)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "You are not authorized to modify this task",
					});

				await ctx.db.tasks.update({
					data: {
						title: input.title,
					},
					where: {
						id: input.taskId,
					},
				});
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later",
				});
			}
		}),
	deleteTask: protectedProcedure
		.input(z.string().uuid("Invalid task ID"))
		.mutation(async ({ input, ctx }) => {
			try {
				// check if user is member of project
				const task = await ctx.db.tasks.findFirst({
					where: {
						id: input,
					},
					include: {
						kanbanColumn: {
							include: {
								project: true,
							},
						},
					},
				});

				if (!task)
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Invalid task ID",
					});

				if (
					!task.kanbanColumn.project.members.includes(ctx.auth.userId)
				)
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message:
							"You do not have permission to delete this task",
					});

				await ctx.db.tasks.delete({
					where: {
						id: input,
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
