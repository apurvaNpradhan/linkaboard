// src/db/repositories/links.ts
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "..";
import {
	type InsertLink,
	links,
	type SelectLink,
	type UpdateLink,
} from "../schema";

export const getAll = async (args: { userId: string; boardId?: number }) => {
	const whereClause = and(
		eq(links.createdBy, args.userId),
		isNull(links.deletedAt),
		args.boardId ? eq(links.boardId, args.boardId) : undefined,
	);

	return db.query.links.findMany({
		where: whereClause,
		orderBy: (links, { desc }) => desc(links.createdAt),
	});
};

export const getAllByCollectionId = async (args: {
	userId: string;
	collectionId: number;
}) => {
	return getAll({ userId: args.userId, boardId: args.collectionId });
};

export const getByPublicId = async (args: {
	publicId: string;
	userId: string;
}) => {
	return db.query.links.findFirst({
		where: and(
			eq(links.publicId, args.publicId),
			eq(links.createdBy, args.userId),
			isNull(links.deletedAt),
		),
	});
};

export const create = async (linkInput: InsertLink) => {
	const [result] = await db
		.insert(links)
		.values({
			...linkInput,
		})
		.returning({
			publicId: links.publicId,
			title: links.title,
			url: links.url,
		});

	return result;
};

export const update = async (
	linkInput: UpdateLink & {
		publicId: string;
		userId: string;
	},
) => {
	const [result] = await db
		.update(links)
		.set({
			...linkInput,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(links.publicId, linkInput.publicId),
				eq(links.createdBy, linkInput.userId),
				isNull(links.deletedAt),
			),
		)
		.returning({
			publicId: links.publicId,
			title: links.title,
			url: links.url,
		});

	return result;
};

export const softDelete = async (args: {
	linkId: number;
	userId: string;
	deletedAt: Date;
}) => {
	const [result] = await db
		.update(links)
		.set({ deletedAt: args.deletedAt })
		.where(
			and(
				eq(links.id, args.linkId),
				eq(links.createdBy, args.userId),
				isNull(links.deletedAt),
			),
		)
		.returning({
			publicId: links.publicId,
			title: links.title,
		});

	return result;
};

export const hardDelete = async (args: { linkId: number; userId: string }) => {
	const [result] = await db
		.delete(links)
		.where(and(eq(links.id, args.linkId), eq(links.createdBy, args.userId)))
		.returning({
			publicId: links.publicId,
			title: links.title,
		});

	return result;
};

export const isUrlUnique = async (args: {
	url: string;
	userId: string;
	ignoreLinkId?: number;
}) => {
	const base = and(
		eq(links.url, args.url),
		eq(links.createdBy, args.userId),
		isNull(links.deletedAt),
	);

	const where = args.ignoreLinkId
		? and(base, sql`${links.id} <> ${args.ignoreLinkId}`)
		: base;

	const existing = await db.query.links.findFirst({
		columns: { id: true },
		where,
	});

	return existing === undefined;
};

export const isLinkUrlAvailable = async (
	url: string,
	userId: string,
	ignoreLinkId?: number,
) => {
	return isUrlUnique({ url, userId, ignoreLinkId });
};
