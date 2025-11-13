import { relations } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
	index,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { timestamps } from "../utils/reusables";
import { UrlSchema } from "../utils/validators";
import { user } from "./auth";
import { boards } from "./boards";

export const links = pgTable(
	"link",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		publicId: varchar("publicId", { length: 12 }).notNull().unique(),
		url: varchar("url", { length: 2048 }).notNull(),
		title: varchar("title", { length: 255 }).notNull(),
		description: text("description"),
		imageUrl: text("image_url"),
		favicon: text("favicon"),
		domain: varchar("domain", { length: 255 }),
		notes: text("notes"),
		isRead: boolean("is_read").notNull().default(false),
		isFavourite: boolean("is_favourite").notNull().default(false), // Fixed spelling
		boardId: bigint("board_id", { mode: "number" }).references(
			() => boards.id,
			{
				onDelete: "cascade",
			},
		),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id, {
				onDelete: "cascade",
			}),

		...timestamps,
	},
	(table) => [
		index("links_board_id_idx").on(table.boardId),
		index("links_created_by_idx").on(table.createdBy),
		index("links_is_read_idx").on(table.isRead),
		index("links_is_favourite_idx").on(table.isFavourite),
	],
);

export const linksRelations = relations(links, ({ one }) => ({
	board: one(boards, {
		fields: [links.boardId],
		references: [boards.id],
		relationName: "linkBoard",
	}),
	createdBy: one(user, {
		fields: [links.createdBy],
		references: [user.id],
		relationName: "linkCreatedByUser",
	}),
}));

export const SelectLink = createSelectSchema(links, {
	createdAt: z.coerce.string(),
	updatedAt: z.coerce.string().nullable(),
	deletedAt: z.coerce.string().nullable(),
});
export type SelectLink = z.infer<typeof SelectLink>;

export const InsertLink = createInsertSchema(links, {
	url: UrlSchema,
	imageUrl: UrlSchema.optional().nullable(),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export type InsertLink = z.infer<typeof InsertLink>;

export const UpdateLink = InsertLink.partial();
export type UpdateLink = z.infer<typeof UpdateLink>;
