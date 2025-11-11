import * as boardRepo from "@linkaboard/db/repository/board.repo";
import { InsertBoard, UpdateBoard } from "@linkaboard/db/schema/boards";
import { generateSlug, generateUID } from "@linkaboard/shared";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure, router } from "..";

export const boardRouter = router({
	all: protectedProcedure.query(async ({ ctx }) => {
		const boards = await boardRepo.getAll({ userId: ctx.session.user.id });
		return boards;
	}),
	create: protectedProcedure
		.input(
			InsertBoard.omit({
				slug: true,
				publicId: true,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			let slug = generateSlug(input.name);
			const isSlugUnique = await boardRepo.isSlugUnique({
				slug: slug,
				userId: ctx.session.user.id,
			});
			if (!isSlugUnique) {
				slug = `${slug}-${generateUID()}`;
			}
			console.log(slug);
			const result = await boardRepo.create({
				publicId: generateUID(),
				slug,
				name: input.name,
				color: input.color,
				description: input.description,
				createdBy: ctx.session.user.id,
			});
			if (!result)
				throw new TRPCError({
					message: "Failed to create board",
					code: "INTERNAL_SERVER_ERROR",
				});
			return result;
		}),
	update: protectedProcedure
		.input(UpdateBoard)
		.mutation(async ({ ctx, input }) => {
			if (input.slug) {
				const isBoardSlugAvailable = await boardRepo.isBoardSlugAvailable(
					input.slug,
					ctx.session.user.id,
				);
				if (!isBoardSlugAvailable) {
					throw new TRPCError({
						message: `Board slug ${input.slug} is not available`,
						code: "BAD_REQUEST",
					});
				}
				const result = await boardRepo.update({
					publicId: input.publicId,
					name: input.name,
					color: input.color,
					description: input.description,
					slug: input.slug,
				});
				if (!result)
					throw new TRPCError({
						message: "Failed to update board",
						code: "INTERNAL_SERVER_ERROR",
					});
				return result;
			}
		}),
});
