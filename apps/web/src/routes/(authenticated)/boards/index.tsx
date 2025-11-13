import { createFileRoute } from "@tanstack/react-router";
import Container from "@/components/layout/container";
import BoardsPage from "@/view/boards";

export const Route = createFileRoute("/(authenticated)/boards/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Container>
			{/*Temp spacing for header*/}
			<div style={{ height: "100px" }} />
			<BoardsPage />
		</Container>
	);
}
