import { and, desc, eq } from "drizzle-orm";
import type z from "zod";
import type { DB } from "..";
import {
	board,
	type InsertPinSchema,
	pin,
	type UpdatePinSchema,
} from "../schema";

export const pinRepo = {
	getAllByBoard: async (db: DB, args: { boardId: bigint; userId: string }) => {
		return await db.query.pin.findMany({
			columns: {
				publicId: true,
				type: true,
				data: true,
				position: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true,
			},
			where: (table, { and, eq }) =>
				and(eq(table.boardId, args.boardId), eq(table.createdBy, args.userId)),
			orderBy: desc(pin.position),
		});
	},

	getById: async (db: DB, args: { id: bigint; userId: string }) => {
		return await db.query.pin.findFirst({
			columns: {
				publicId: true,
				type: true,
				data: true,
				position: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true,
			},
			where: (table, { and, eq }) =>
				and(eq(table.id, args.id), eq(table.createdBy, args.userId)),
		});
	},

	getIdByPublicId: async (
		db: DB,
		args: { publicId: string; userId: string },
	) => {
		return await db.query.pin.findFirst({
			columns: {
				id: true,
				boardId: true,
			},
			where: (table, { and, eq }) =>
				and(
					eq(table.publicId, args.publicId),
					eq(table.createdBy, args.userId),
				),
		});
	},

	create: async (
		db: DB,
		args: {
			input: z.infer<typeof InsertPinSchema>;
		},
	) => {
		return await db
			.insert(pin)
			.values(args.input)
			.returning({ publicId: pin.publicId });
	},

	getLastPosition: async (
		db: DB,
		args: { boardId: bigint; userId: string },
	) => {
		return await db.query.pin.findFirst({
			columns: {
				position: true,
			},
			where: (table, { and, eq }) =>
				and(eq(table.boardId, args.boardId), eq(table.createdBy, args.userId)),
			orderBy: desc(pin.position),
		});
	},

	update: async (
		db: DB,
		args: {
			id: bigint;
			userId: string;
			input: z.infer<typeof UpdatePinSchema>;
		},
	) => {
		return await db
			.update(pin)
			.set(args.input)
			.where(and(eq(pin.id, args.id), eq(pin.createdBy, args.userId)));
	},

	softDelete: async (db: DB, args: { id: bigint; userId: string }) => {
		return await db
			.update(pin)
			.set({ deletedAt: new Date() })
			.where(and(eq(pin.id, args.id), eq(pin.createdBy, args.userId)));
	},

	hardDelete: async (db: DB, args: { id: bigint; userId: string }) => {
		return await db
			.delete(pin)
			.where(and(eq(pin.id, args.id), eq(pin.createdBy, args.userId)));
	},

	getAllByBoardPublicId: async (
		db: DB,
		args: { boardPublicId: string; userId: string },
	) => {
		return await db.query.pin.findMany({
			columns: {
				publicId: true,
				type: true,
				data: true,
				position: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true,
			},
			with: {
				board: {
					columns: {
						publicId: true,
					},
				},
			},
			where: (table, { and, eq }) =>
				and(eq(table.createdBy, args.userId), eq(table.boardId, board.id)),
		});
	},

	getAll: async (db: DB, args: { userId: string }) => {
		return await db.query.pin.findMany({
			columns: {
				publicId: true,
				type: true,
				data: true,
				position: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true,
			},
			with: {
				board: {
					columns: {
						publicId: true,
					},
				},
			},
			where: (table, { eq }) => eq(table.createdBy, args.userId),
			orderBy: desc(pin.position),
		});
	},

	moveToBoard: async (
		db: DB,
		args: {
			id: bigint;
			userId: string;
			newBoardId: bigint;
			newPosition: string;
		},
	) => {
		return await db
			.update(pin)
			.set({
				boardId: args.newBoardId,
				position: args.newPosition,
			})
			.where(and(eq(pin.id, args.id), eq(pin.createdBy, args.userId)));
	},
};
