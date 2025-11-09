import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/")({
	component: HomeComponent,
});

const TITLE_TEXT = `
██╗     ██╗███╗   ██╗██╗  ██╗ █████╗ ██████╗  ██████╗  █████╗ ██████╗ ██████╗
██║     ██║████╗  ██║██║ ██╔╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
██║     ██║██╔██╗ ██║█████╔╝ ███████║██████╔╝██║   ██║███████║██████╔╝██║  ██║
██║     ██║██║╚██╗██║██╔═██╗ ██╔══██║██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║
███████╗██║██║ ╚████║██║  ██╗██║  ██║██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
`;

function HomeComponent() {
	return (
		<div className="container mx-auto mt-20 max-w-3xl px-4 py-2">
			<pre className="overflow-x-auto text-center font-mono text-primary text-sm">
				{TITLE_TEXT}
			</pre>
			<p className="mt-4 text-center font-mono text-lg text-muted-foreground">
				Manage links, articles and bookmarks for later.
			</p>
		</div>
	);
}
