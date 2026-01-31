import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());
	const mutation = useMutation(trpc.scraperRouter.run.mutationOptions());

	const [url, setUrl] = useState("");

	const page = mutation.data?.data;

	return (
		<div className="container mx-auto max-w-3xl px-4 py-6">
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-3 font-medium">Run Scraper</h2>

					<form
						className="flex gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							if (!url.trim()) return;

							mutation.mutate({ url });
						}}
					>
						<Input
							placeholder="https://example.com"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
						/>

						<Button type="submit" disabled={!url.trim() || mutation.isPending}>
							{mutation.isPending ? "Scraping..." : "Run"}
						</Button>
					</form>
				</section>

				{page && (
					<section className="overflow-hidden rounded-lg border">
						{page.image && (
							<img
								src={page.image}
								alt={page.title ?? "Page preview"}
								className="h-48 w-full object-cover"
							/>
						)}

						<div className="space-y-2 p-4">
							<h3 className="font-semibold text-lg">
								{page.title ?? "Untitled page"}
							</h3>

							{page.description ? (
								<p className="text-muted-foreground text-sm">
									{page.description}
								</p>
							) : (
								<p className="text-muted-foreground text-sm italic">
									No description available
								</p>
							)}

							<div className="flex items-center gap-2 pt-2 text-muted-foreground text-sm">
								{page.favicon && (
									<img src={page.favicon} alt="Favicon" className="h-4 w-4" />
								)}

								<span>{page.siteName ?? "Unknown site"}</span>
							</div>
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
