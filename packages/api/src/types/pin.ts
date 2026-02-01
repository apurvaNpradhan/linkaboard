import type { SerializedEditorState } from "@linkaboard/db/libs/types";
import { SelectPinSchema } from "@linkaboard/db/schema/pin";

import z from "zod";

const LinkPinDataSchema = z.object({
	url: z.url(),
});
const NotePinDataSchema = z.object({
	content: z.custom<SerializedEditorState>(),
});

const PinDataSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("link"),
		data: LinkPinDataSchema,
	}),
	z.object({
		type: z.literal("note"),
		data: NotePinDataSchema,
	}),
]);
export const InsertPinInput = z.object({
	boardPublicId: z.string(),
	data: PinDataSchema,
});

export const UpdatePinInput = z.object({
	publicId: z.string(),
	data: PinDataSchema.optional(),
	position: z.string().optional(),
});

export type PinInput = z.infer<typeof InsertPinInput>;
export type UpdatePinInput = z.infer<typeof UpdatePinInput>;
export const PinSchema = SelectPinSchema.omit({
	boardId: true,
	id: true,
	createdBy: true,
}).extend({
	boardPublicId: z.string(),
});
export type PinSchema = z.infer<typeof PinSchema>;
