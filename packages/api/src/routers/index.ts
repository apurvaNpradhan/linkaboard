import { protectedProcedure, publicProcedure, router } from "../index";
import { boardRouter } from "./board";
import { pinRouter } from "./pin";
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
	board: boardRouter,
	pin: pinRouter,
});
export type AppRouter = typeof appRouter;
