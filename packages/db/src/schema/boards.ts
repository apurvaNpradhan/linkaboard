import { relations, sql } from "drizzle-orm";
import {
	bigserial,
	index,
	pgTable,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { timestamps } from "../utils/reusables";
import {
	ColorSchema,
	DescriptionSchema,
	NameSchema,
	SlugSchema,
} from "../utils/validators";
import { user } from "./auth";
import { links } from "./links";

export const boards = pgTable(
	"board",
	{
		// id: text("id")
		//   .primaryKey()
		//   .default(sql`uuid_generate_v7()`),
		id: bigserial("id", { mode: "number" }).primaryKey(),
		publicId: varchar("publicId", { length: 12 }).notNull().unique(),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		color: varchar("color").notNull(),
		slug: varchar("slug", { length: 255 }).notNull(),
		createdBy: text("createdBy").references(() => user.id, {
			onDelete: "set null",
		}),
		...timestamps,
	},
	(table) => [
		index("boards_created_by_idx").on(table.createdBy),
		uniqueIndex("boards_slug_index")
			.on(table.createdBy, table.slug)
			.where(sql`${table.deletedAt} IS NULL`),
	],
);

export const boardsRelations = relations(boards, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [boards.createdBy],
		references: [user.id],
		relationName: "boardCreatedByUser",
	}),
	links: many(links),
}));

export const SelectBoard = createSelectSchema(boards, {
	createdAt: z.coerce.string(),
	updatedAt: z.coerce.string(),
	deletedAt: z.coerce.string(),
});

export type SelectBoard = z.infer<typeof SelectBoard>;

export const InsertBoard = createInsertSchema(boards, {
	name: NameSchema,
	description: DescriptionSchema,
	color: ColorSchema,
}).omit({
	id: true,
	// createdBy: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export type InsertBoard = z.infer<typeof InsertBoard>;

export const UpdateBoard = InsertBoard.partial({
	description: true,
	name: true,
	slug: true,
});
export type UpdateBoard = z.infer<typeof UpdateBoard>;
