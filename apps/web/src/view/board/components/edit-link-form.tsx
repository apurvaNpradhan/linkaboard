import { type SelectLink, UpdateLink } from "@linkaboard/db/schema/links";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { CheckCircle2, Heart } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/providers/modal-provider";
import { queryClient } from "@/router";
import { useTRPC } from "@/utils/trpc";

interface EditLinkFormProps {
	link: SelectLink;
}

export default function EditLinkForm({ link }: EditLinkFormProps) {
	const { closeModal } = useModal();
	const trpc = useTRPC();
	const { id } = useParams({ from: "/(authenticated)/boards/$id" });

	const mutation = useMutation(
		trpc.link.update.mutationOptions({
			onMutate: async (args) => {
				await queryClient.cancelQueries({
					queryKey: trpc.board.byId.queryKey({ id }),
				});
				closeModal();
				const prevData = queryClient.getQueryData(
					trpc.board.byId.queryKey({ id }),
				);
				if (prevData) {
					queryClient.setQueryData(
						trpc.board.byId.queryKey({ id }),
						(old: any) => {
							if (!old) return prevData;
							const updatedLinks = old.links.map((l: SelectLink) =>
								l.id === link.id
									? { ...l, ...args, updatedAt: new Date().toISOString() }
									: l,
							);
							return { ...old, links: updatedLinks };
						},
					);
				}
				return { prevState: prevData };
			},
			onError: (_err, _vars, context) => {
				queryClient.setQueryData(
					trpc.board.byId.queryKey({ id }),
					context?.prevState,
				);
				toast.error(_err.message);
			},
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.board.byId.queryKey({ id }),
				});
				toast.success(`${data?.title} updated`);
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			url: link.url,
			title: link.title,
			description: link.description ?? "",
			notes: link.notes ?? "",
			isFavourite: link.isFavourite,
			isRead: link.isRead,
		} as z.input<typeof UpdateLink>,
		validators: {
			onDynamic: UpdateLink,
			onDynamicAsyncDebounceMs: 300,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				publicId: link.publicId,
				...value,
			});
		},
		onSubmitInvalid: ({ formApi }) => {
			const errorMap = formApi.state.errorMap.onDynamic;
			const firstErrorField = Object.keys(errorMap || {}).find(
				(name) => errorMap?.[name],
			);
			if (firstErrorField) {
				const input = document.querySelector(
					`input[name="${firstErrorField}"], textarea[name="${firstErrorField}"]`,
				) as HTMLInputElement | HTMLTextAreaElement | null;
				input?.focus();
			}
		},
	});

	useEffect(() => {
		const el = document.querySelector("#link-title") as HTMLElement | null;
		el?.focus();
	}, []);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex h-full flex-col gap-4"
		>
			<form.Field name="title">
				{(field) => (
					<div>
						<Input
							id="link-title"
							placeholder="Title"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							aria-invalid={!!field.state.meta.errors.length}
						/>
						{field.state.meta.errors.map((error, i) => (
							<p key={_i} className="mt-1 text-red-500 text-sm">
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			<form.Field name="url">
				{(field) => (
					<div>
						<Input
							placeholder="URL"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							aria-invalid={!!field.state.meta.errors.length}
						/>
						{field.state.meta.errors.map((error, i) => (
							<p key={_i} className="mt-1 text-red-500 text-sm">
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<Textarea
						placeholder="Description (optional)"
						value={field.state.value}
						onChange={(e) => field.handleChange(e.target.value)}
						rows={2}
					/>
				)}
			</form.Field>

			<form.Field name="notes">
				{(field) => (
					<Textarea
						placeholder="Notes (optional)"
						value={field.state.value}
						onChange={(e) => field.handleChange(e.target.value)}
						rows={3}
					/>
				)}
			</form.Field>

			<div className="flex items-center gap-6">
				<form.Field name="isFavourite">
					{(field) => (
						<Label className="flex cursor-pointer items-center gap-2">
							<Checkbox
								checked={field.state.value}
								onCheckedChange={(checked) =>
									field.handleChange(checked as boolean)
								}
							/>
							<Heart
								className={`h-4 w-4 ${
									field.state.value ? "fill-red-500 text-red-500" : ""
								}`}
							/>
							Favorite
						</Label>
					)}
				</form.Field>

				<form.Field name="isRead">
					{(field) => (
						<Label className="flex cursor-pointer items-center gap-2">
							<Checkbox
								checked={field.state.value}
								onCheckedChange={(checked) =>
									field.handleChange(checked as boolean)
								}
							/>
							<CheckCircle2
								className={`h-4 w-4 ${
									field.state.value ? "text-green-600" : ""
								}`}
							/>
							Read
						</Label>
					)}
				</form.Field>
			</div>

			<form.Subscribe
				selector={(state) => ({
					isSubmitting: state.isSubmitting,
					canSubmit: state.canSubmit,
				})}
			>
				{({ isSubmitting, canSubmit }) => (
					<div className="mt-4 flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								closeModal();
								form.reset();
							}}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!canSubmit || isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner className="mr-2 h-4 w-4" />
									Saving
								</>
							) : (
								"Save"
							)}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
