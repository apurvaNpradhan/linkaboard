import { protectedProcedure, publicProcedure, router } from "../index";
import { boardRouter } from "./board";
import { linkRouter } from "./link";

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
	link: linkRouter,
});
export type AppRouter = typeof appRouter;
