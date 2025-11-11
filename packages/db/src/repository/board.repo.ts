import { and, eq, isNull } from "drizzle-orm";
import { db } from "..";
import { boards, type InsertBoard, type UpdateBoard } from "../schema";

export const getAll = async (args: { userId: string }) => {
	const result = await db.query.boards.findMany({
		where: eq(boards.createdBy, args.userId),
	});
	return result;
};
export const create = async (boardInput: InsertBoard) => {
	const [result] = await db.insert(boards).values(boardInput).returning({
		id: boards.id,
		name: boards.name,
	});
	return result;
};

export const update = async (boardInput: UpdateBoard) => {
	const [result] = await db
		.update(boards)
		.set({
			name: boardInput.name,
			description: boardInput.description,
			slug: boardInput.slug,
			updatedAt: new Date(),
		})
		.where(eq(boards.publicId, boardInput.publicId))
		.returning({
			publicId: boards.publicId,
			name: boards.name,
		});
	return result;
};

export const softDelete = async (args: {
	boardId: number;
	deletedAt: Date;
}) => {
	const [result] = await db
		.update(boards)
		.set({ deletedAt: args.deletedAt })
		.where(and(eq(boards.id, args.boardId), isNull(boards.deletedAt)))
		.returning({
			publicId: boards.publicId,
			name: boards.name,
		});

	return result;
};

export const hardDelete = async (id: number) => {
	const [result] = await db.delete(boards).where(eq(boards.id, id)).returning({
		publicId: boards.publicId,
		name: boards.name,
	});

	return result;
};

export const isSlugUnique = async (args: { slug: string; userId: string }) => {
	const result = await db.query.boards.findFirst({
		columns: {
			slug: true,
		},
		where: and(
			eq(boards.slug, args.slug),
			eq(boards.createdBy, args.userId),
			isNull(boards.deletedAt),
		),
	});

	return result === undefined;
};

export const isBoardSlugAvailable = async (
	boardSlug: string,
	userId: string,
) => {
	const result = await db.query.boards.findFirst({
		columns: {
			id: true,
		},
		where: and(
			eq(boards.slug, boardSlug),
			eq(boards.createdBy, userId),
			isNull(boards.deletedAt),
		),
	});

	return result === undefined;
};
