import { env } from "@linkaboard/env/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "..";

export const scraperRouter = router({
	health: publicProcedure.query(async () => {
		const res = await fetch(`${env.SCRAPER_URL}/v1/scraper/health`);

		if (!res.ok) {
			throw new Error(`Health check failed: ${res.status}`);
		}

		const json = await res.json();
		const data = HealthResponseSchema.parse(json);

		return { ok: true, data };
	}),

	run: publicProcedure
		.input(
			z.object({
				url: z.url(),
			}),
		)
		.mutation(async ({ input }) => {
			const res = await fetch(`${env.SCRAPER_URL}/v1/scraper/run`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(input),
			});

			if (!res.ok) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Failed to scrape url: ${res.status}`,
				});
			}

			const json = await res.json();
			const data = pageInfoSchema.parse(json);

			return { ok: true, data };
		}),
});

const HealthResponseSchema = z.object({
	message: z.string(),
});

export const pageInfoSchema = z.object({
	statusCode: z.number().int(),
	title: z.string().optional(),
	description: z.string().optional(),
	image: z.string().optional(),
	siteName: z.string().optional(),
	favicon: z.string().optional(),
});
