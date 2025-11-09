import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/(authenticated)")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const session = await getUser();
		if (!session) {
			throw redirect({
				to: "/sign-in",
			});
		}
	},
});

function RouteComponent() {
	return <Outlet />;
}
