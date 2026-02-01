import { and, desc, eq } from "drizzle-orm";
import type z from "zod";
import type { DB } from "..";
import {
	board,
	type InsertBoardSchema,
	type UpdateBoardSchema,
} from "../schema";

export const boardRepo = {
	getAll: async (db: DB, args: { userId: string }) => {
		return await db.query.board.findMany({
			columns: {
				publicId: true,
				name: true,
				description: true,
				position: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true,
			},
			where: (table, { eq }) => eq(table.createdBy, args.userId),
			orderBy: desc(board.position),
		});
	},
	getbyId: async (db: DB, args: { id: bigint; userId: string }) => {
		return await db.query.board.findFirst({
			columns: {
				publicId: true,
				name: true,
				description: true,
				position: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true,
			},
			where: (table, { eq, and }) =>
				and(eq(table.id, args.id), eq(table.createdBy, args.userId)),
		});
	},
	getIdByPublicId: async (db: DB, args: { publicId: string }) => {
		return await db.query.board.findFirst({
			columns: {
				id: true,
			},
			where: (table, { eq }) => eq(table.publicId, args.publicId),
		});
	},
	create: async (
		db: DB,
		args: {
			input: z.infer<typeof InsertBoardSchema>;
		},
	) => {
		return await db
			.insert(board)
			.values(args.input)
			.returning({ publicId: board.publicId });
	},
	getlastPosition: async (db: DB, args: { userId: string }) => {
		return await db.query.board.findFirst({
			columns: {
				position: true,
			},
			where: (table, { eq }) => eq(table.createdBy, args.userId),
			orderBy: desc(board.position),
		});
	},
	update: async (
		db: DB,
		args: {
			id: bigint;
			userId: string;
			input: z.infer<typeof UpdateBoardSchema>;
		},
	) => {
		return await db
			.update(board)
			.set(args.input)
			.where(and(eq(board.id, args.id), eq(board.createdBy, args.userId)));
	},
	softDelete: async (db: DB, args: { id: bigint; userId: string }) => {
		return await db
			.update(board)
			.set({ deletedAt: new Date() })
			.where(and(eq(board.id, args.id), eq(board.createdBy, args.userId)));
	},
	hardDelete: async (db: DB, args: { id: bigint; userId: string }) => {
		return await db
			.delete(board)
			.where(and(eq(board.id, args.id), eq(board.createdBy, args.userId)));
	},
};
