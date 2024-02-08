import { env } from "~/env.mjs";
import { createTRPCRouter } from "../trpc";
import { protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { supabase } from "~/server/supabase";
import { clerkClient } from "@clerk/nextjs";
import { createId } from "@paralleldrive/cuid2";
import { getDateOffset } from "~/lib/utils";

export const exampleRouter = createTRPCRouter({
	clearExistingData: protectedProcedure.mutation(async ({ ctx }) => {
		const user = await clerkClient.users.getUser(ctx.auth.userId);
		if (
			user?.emailAddresses?.[0]?.emailAddress !==
			env.NEXT_PUBLIC_EXAMPLE_ACCOUNT_EMAIL
		)
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Only example account can access this route.",
			});

		let projects;

		try {
			projects = await ctx.db.projects.findMany({
				where: {
					members: {
						has: ctx.auth.userId,
					},
				},
			});

			await ctx.db.projects.deleteMany({
				where: {
					id: {
						in: projects.map((p) => p.id),
					},
				},
			});
		} catch {
			throw ctx.internalServerError;
		}

		let res;
		try {
			for (const project of projects) {
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
			}
		} catch (e) {
			if (e instanceof Error)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: e.message,
				});
			throw ctx.internalServerError;
		}
	}),
	generateDemoData: protectedProcedure.mutation(async ({ ctx }) => {
		const user = await clerkClient.users.getUser(ctx.auth.userId);
		if (
			user?.emailAddresses?.[0]?.emailAddress !==
			env.NEXT_PUBLIC_EXAMPLE_ACCOUNT_EMAIL
		)
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Only example account can access this route.",
			});

		const kanbanColumns = {
			pending: "Pending",
			inProgress: "In Progress",
			completed: "Completed",
		} as const;

		// generate 20 random UUIDs for use later
		const randomIds = Array.from({ length: 20 }, () => crypto.randomUUID());

		const project = await ctx.db.projects.create({
			select: {
				id: true,
				members: true,
				kanbanColumns: true,
				threads: true,
				files: true,
				polls: true,
			},
			data: {
				name: "Distributed File System Implementation",
				leader: ctx.auth.userId,
				members: [
					ctx.auth.userId,
					env.TEST1_USER_ID,
					env.TEST2_USER_ID,
					env.TEST3_USER_ID,
					env.TEST4_USER_ID,
				],
				description:
					"The goal of this project is to design and implement a distributed file system that supports efficient and reliable file storage and retrieval across multiple nodes.",
				dueDate: getDateOffset(30),
				password: createId(),
				kanbanColumns: {
					createMany: {
						data: [
							{
								name: kanbanColumns.pending,
								sortOrder: 0,
							},
							{
								name: kanbanColumns.inProgress,
								sortOrder: 1,
							},
							{
								name: kanbanColumns.completed,
								sortOrder: 2,
							},
						],
					},
				},
				threads: {
					createMany: {
						data: [
							{
								title: "Project Kickoff",
								author: ctx.auth.userId,
								content:
									"<p>Hey, team! 👋 Welcome to this group assignment. I thought it would be a good idea to start discussing our roles and the overall plan. I'm happy to take on any specific tasks or help with organizing our work. What are your thoughts?</p>",
								createdAt: getDateOffset(-8),
								updatedAt: getDateOffset(-8),
							},
							{
								title: "Meetings on Next Wednesday",
								author: ctx.auth.userId,
								content: "",
								createdAt: getDateOffset(-5),
								updatedAt: getDateOffset(-5),
							},
						],
					},
				},
				files: {
					createMany: {
						data: [
							{
								fileName: "Assignment Requirements.pdf",
								uploadedBy: ctx.auth.userId,
							},
							{
								fileName: "Report.docx",
								uploadedBy: env.TEST3_USER_ID,
							},
						],
					},
				},
				polls: {
					createMany: {
						data: [
							{
								title: "Tech Stack Preference",
							},
							{
								title: "Meeting Schedule",
							},
						],
					},
				},
			},
		});

		function getKanbanColumnId(columnName: keyof typeof kanbanColumns) {
			const id =
				project.kanbanColumns.find(
					(c) => c.name === kanbanColumns[columnName],
				)?.id ?? project.kanbanColumns?.[0]?.id;
			if (!id)
				throw new Error(
					"Something went wrong while generating task data",
				);
			return id;
		}

		// tasks
		await ctx.db.tasks.createMany({
			data: [
				{
					title: "System Architecture Design",
					kanbanColumnId: getKanbanColumnId("completed"),
					sortOrder: 0,
					description:
						'<p>Design the overall architecture of the distributed file system, considering issues such as:</p><ul><li class="my-0"><p>Data distribution</p></li><li class="my-0"><p>Fault tolerance</p></li><li class="my-0"><p>Scalability</p></li></ul>',
					dueDate: getDateOffset(-7),
					assignedMembers: [ctx.auth.userId, env.TEST2_USER_ID],
				},
				{
					title: "Node Communication Protocol",
					kanbanColumnId: getKanbanColumnId("inProgress"),
					sortOrder: 0,
					description:
						"<p>Develop a communication protocol that allows seamless communication between nodes in the distributed file system.</p>",
					dueDate: getDateOffset(4),
					assignedMembers: [env.TEST3_USER_ID, env.TEST2_USER_ID],
				},
				{
					title: "File Replication Strategy",
					kanbanColumnId: getKanbanColumnId("inProgress"),
					sortOrder: 1,
					description:
						"<p>Implement a file replication strategy to ensure data redundancy and fault tolerance.</p>",
					dueDate: getDateOffset(7),
					assignedMembers: [env.TEST1_USER_ID],
				},
				{
					title: "Consistency Mechanism",
					kanbanColumnId: getKanbanColumnId("pending"),
					sortOrder: 0,
					description:
						"<p>Implement a consistency mechanism to maintain data integrity across the distributed nodes.</p>",
					assignedMembers: [env.TEST4_USER_ID],
				},
				{
					title: "User Interface",
					kanbanColumnId: getKanbanColumnId("pending"),
					sortOrder: 1,
					description:
						"<p>Design and implement a user interface for interacting with the distributed file system.</p>",
				},
			],
		});

		function getThreadId(index: number) {
			const id = project.threads.at(index)?.id;
			if (!id)
				throw new Error(
					"Something went wrong while generating thread replies.",
				);
			return id;
		}

		//thread replies
		await ctx.db.threadReplies.createMany({
			data: [
				{
					threadId: getThreadId(0),
					author: env.TEST3_USER_ID,
					content:
						"Sounds great, guys! I'm comfortable with editing and proofreading, so I can take on the responsibility of polishing the final document before submission. Let me know when you need me to jump in.",
					createdAt: getDateOffset(-7),
					updatedAt: getDateOffset(-7),
				},
				{
					threadId: getThreadId(0),
					author: env.TEST2_USER_ID,
					content:
						"<p>Hey guys, I'm more into design and visuals, so I'd be happy to work on any charts, graphs, or presentations we might need. Just let me know the details.</p>",
					createdAt: getDateOffset(-7),
					updatedAt: getDateOffset(-7),
				},
				{
					threadId: getThreadId(0),
					author: env.TEST1_USER_ID,
					content:
						"<p>Hi everyone! Thanks for getting this started. I'm good with doing research and compiling information. If anyone has any idea, let me know!</p>",
					createdAt: getDateOffset(-7),
					updatedAt: getDateOffset(-7),
				},
				{
					id: randomIds[0],
					threadId: getThreadId(0),
					author: ctx.auth.userId,
					content:
						"Awesome responses, everyone! It seems like we've got a good mix of skills. I'll upload a file to the project files page, we can all work on that together.",
					createdAt: getDateOffset(-6),
					updatedAt: getDateOffset(-6),
				},
				{
					threadId: getThreadId(0),
					author: env.TEST4_USER_ID,
					content:
						"<p>Great idea! We can start by dividing the sections among ourselves and then collaborate on the shared document.</p>",
					createdAt: getDateOffset(-5),
					updatedAt: getDateOffset(-5),
					parentId: randomIds[0],
				},
				{
					threadId: getThreadId(1),
					author: env.TEST1_USER_ID,
					content: "<p>Noted thanks.</p>",
					createdAt: getDateOffset(-3),
					updatedAt: getDateOffset(-3),
				},
				{
					id: randomIds[1],
					threadId: getThreadId(1),
					author: env.TEST2_USER_ID,
					content: "<p>Do you need me to bring my laptop?</p>",
					createdAt: getDateOffset(-3),
					updatedAt: getDateOffset(-3),
				},
				{
					id: randomIds[2],
					threadId: getThreadId(1),
					author: ctx.auth.userId,
					content:
						"<p>Yeah that'd be great, I almost forgot. Thanks for the reminder.</p>",
					createdAt: getDateOffset(-3),
					updatedAt: getDateOffset(-3),
					parentId: randomIds[1],
				},
				{
					threadId: getThreadId(1),
					author: env.TEST2_USER_ID,
					content: "<p>No problem!</p>",
					createdAt: getDateOffset(-3),
					updatedAt: getDateOffset(-3),
					parentId: randomIds[2],
				},
			],
		});

		function getPollId(index: number) {
			const id = project.polls.at(index)?.id;
			if (!id)
				throw new Error(
					"Something went wrong while generating thread replies.",
				);
			return id;
		}

		// poll options
		await ctx.db.pollOptions.createMany({
			data: [
				{
					pollsId: getPollId(0),
					sortOrder: 0,
					title: "C++",
					votedBy: [ctx.auth.userId],
				},
				{
					pollsId: getPollId(0),
					sortOrder: 1,
					title: "C#",
					votedBy: [env.TEST1_USER_ID, env.TEST2_USER_ID],
				},
				{
					pollsId: getPollId(0),
					sortOrder: 2,
					title: "Java",
					votedBy: [env.TEST3_USER_ID, env.TEST4_USER_ID],
				},
				{
					pollsId: getPollId(1),
					sortOrder: 0,
					title: "Monday",
					votedBy: [
						env.TEST1_USER_ID,
						env.TEST2_USER_ID,
						env.TEST4_USER_ID,
					],
				},
				{
					pollsId: getPollId(1),
					sortOrder: 1,
					title: "Tuesday",
					votedBy: [ctx.auth.userId],
				},
				{
					pollsId: getPollId(1),
					sortOrder: 2,
					title: "Wednesday",
					votedBy: [],
				},
				{
					pollsId: getPollId(1),
					sortOrder: 3,
					title: "Thursday",
					votedBy: [env.TEST3_USER_ID],
				},
				{
					pollsId: getPollId(1),
					sortOrder: 4,
					title: "Friday",
					votedBy: [],
				},
			],
		});

		function getFileId(index: number) {
			const id = project.files.at(index)?.id;
			if (!id)
				throw new Error(
					"Something went wrong while generating thread replies.",
				);
			return id;
		}

		// copy file
		const allRes = await Promise.all([
			supabase.storage
				.from("projects")
				.copy("example/thumbnail", `${project.id}/thumbnail`),
			supabase.storage
				.from("projects")
				.copy("example/file1", `${project.id}/files/${getFileId(0)}`),
			supabase.storage
				.from("projects")
				.copy("example/file2", `${project.id}/files/${getFileId(1)}`),
		]);

		for (const res of allRes) {
			if (res.error)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: res.error.message,
				});
		}
	}),
});
