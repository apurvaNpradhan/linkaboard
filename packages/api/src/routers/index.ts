import { protectedProcedure, publicProcedure, router } from "../index";
import { scraperRouter } from "./scraper";
export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	scraperRouter,
});
export type AppRouter = typeof appRouter;
