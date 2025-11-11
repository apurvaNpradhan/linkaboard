import { protectedProcedure, publicProcedure, router } from "../index";
import { boardRouter } from "./board";

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
	board: boardRouter,
});
export type AppRouter = typeof appRouter;
