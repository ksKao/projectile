import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProjectSchema } from "~/lib/schema";
import { generatePassword } from "~/lib/utils";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/supabase";

export const projectRouter = createTRPCRouter({
	createProject: protectedProcedure
		.input(createProjectSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const project = await ctx.db.projects.create({
					data: {
						name: input.name,
						description: input.description,
						dueDate: input.dueDate,
						password: generatePassword(),
						leader: ctx.auth.userId,
						members: [ctx.auth.userId],
					},
				});

				const imageExtension = input.image.split(".").pop();
				const { data, error } = await supabase.storage
					.from("projects")
					.createSignedUploadUrl(
						`${project.id}/thumbnail.${imageExtension}`,
					);

				if (error)
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: error.message,
					});

				console.log("return");
				console.log(data);

				return data.signedUrl;
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong. Please try again later.",
				});
			}
		}),
});
