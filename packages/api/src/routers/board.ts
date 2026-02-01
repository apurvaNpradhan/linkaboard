import { boardRepo } from "@linkaboard/db/repository/board.repo";
import { generateKey } from "@linkaboard/shared/utils";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure } from "..";
import { InsertBoardInput, UpdateBoardInput } from "../types/board";

export const boardRouter = {
	all: protectedProcedure.query(async ({ ctx, input }) => {
		return await boardRepo.getAll(ctx.db, { userId: ctx.session.user.id });
	}),
	byId: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.query(async ({ ctx, input }) => {
			const id = await boardRepo.getIdByPublicId(ctx.db, {
				publicId: input.publicId,
			});
			if (!id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Board not found",
				});
			}
			return await boardRepo.getbyId(ctx.db, {
				id: id.id,
				userId: ctx.session.user.id,
			});
		}),
	create: protectedProcedure
		.input(InsertBoardInput)
		.mutation(async ({ ctx, input }) => {
			const lastPosition = await boardRepo.getlastPosition(ctx.db, {
				userId: ctx.session.user.id,
			});
			const position = generateKey(lastPosition?.position ?? null, null);
			return await boardRepo.create(ctx.db, {
				input: {
					...input,
					position,
					createdBy: ctx.session.user.id,
				},
			});
		}),
	update: protectedProcedure
		.input(UpdateBoardInput)
		.mutation(async ({ ctx, input }) => {
			const { publicId, ...rest } = input;
			const id = await boardRepo.getIdByPublicId(ctx.db, { publicId });
			if (!id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Board not found",
				});
			}
			return await boardRepo.update(ctx.db, {
				id: id.id,
				input: {
					...rest,
					updatedAt: new Date(),
				},
				userId: ctx.session.user.id,
			});
		}),
	delete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { publicId } = input;
			const id = await boardRepo.getIdByPublicId(ctx.db, { publicId });
			if (!id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Board not found",
				});
			}
			return await boardRepo.softDelete(ctx.db, {
				id: id.id,
				userId: ctx.session.user.id,
			});
		}),
	hardDelete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { publicId } = input;
			const id = await boardRepo.getIdByPublicId(ctx.db, { publicId });
			if (!id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Board not found",
				});
			}
			return await boardRepo.hardDelete(ctx.db, {
				id: id.id,
				userId: ctx.session.user.id,
			});
		}),
};
