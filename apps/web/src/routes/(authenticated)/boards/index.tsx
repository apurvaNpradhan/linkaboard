import { createFileRoute } from "@tanstack/react-router";
import Container from "@/components/layout/container";
import BoardPage from "@/view/boards";

export const Route = createFileRoute("/(authenticated)/boards/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Container>
			{/*Temp spacing for header*/}
			<div style={{ height: "100px" }} />
			<BoardPage />
		</Container>
	);
}
