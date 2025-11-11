import { createFileRoute } from "@tanstack/react-router";
import BoardPage from "@/view/board";

export const Route = createFileRoute("/(authenticated)/boards/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<div style={{ height: "100px" }} />
			<BoardPage />
		</>
	);
}
