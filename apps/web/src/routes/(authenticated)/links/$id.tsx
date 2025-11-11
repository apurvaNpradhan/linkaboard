import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/links/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(authenticated)/links/$id"!</div>;
}
