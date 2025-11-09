import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/(auth)/sign-in/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(public)/(auth)/sign-in/"!</div>;
}
