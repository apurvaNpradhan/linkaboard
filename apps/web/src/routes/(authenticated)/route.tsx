import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authStateCollection, sessionQueryOptions } from "@/lib/auth-client";

export const Route = createFileRoute("/(authenticated)")({
	component: RouteComponent,

	beforeLoad: async ({ context }) => {
		const auth = authStateCollection.get("auth");
		if (auth && new Date(auth.session.expiresAt) > new Date()) {
			return auth;
		}
		const result =
			await context.queryClient.ensureQueryData(sessionQueryOptions);
		if (!result.data?.session) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}

		authStateCollection.insert({
			id: "auth",
			user: result.data.user,
			session: result.data.session,
		});

		return result.data;
	},

	errorComponent: ({ error }) => {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="mb-4 font-bold text-2xl text-red-600">Error</h1>
					<p className="mb-4 text-muted-foreground">
						{error?.message || "An unexpected error occurred"}
					</p>
					<Button onClick={() => window.location.reload()}>Retry</Button>
				</div>
			</div>
		);
	},
});

function RouteComponent() {
	const session = Route.useRouteContext();
	if (!session) {
		return null;
	}

	return <Outlet />;
}
