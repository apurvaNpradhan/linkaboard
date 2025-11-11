import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/boards/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(authenticated)/boards/$id"!</div>;
}
