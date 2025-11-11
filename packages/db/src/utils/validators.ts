import { z } from "zod";

export const SearchSchema = z.object({
	q: z.string().min(1, "You must enter a search term."),
});

export type SearchSchema = z.infer<typeof SearchSchema>;

export const NameSchema = z.string().min(1).max(255);
export const DescriptionSchema = z.string().max(1000).or(z.null());
//Upadte slug schema
export const SlugSchema = z.string().min(1).max(255);
export const ColorSchema = z
	.string()
	.regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color");
export const DateSchema = z.date({
	message: "Date is required",
});

export const UrlSchema = z.string().url().max(2048);
