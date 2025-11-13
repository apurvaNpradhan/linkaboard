import { InsertLink, type SelectLink } from "@linkaboard/db/schema/links";
import { generateUID } from "@linkaboard/shared";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useModal } from "@/providers/modal-provider";
import { queryClient } from "@/router";
import { useTRPC } from "@/utils/trpc";

export default function NewLinkForm() {
	const { closeModal } = useModal();
	const trpc = useTRPC();
	const { id } = useParams({
		from: "/(authenticated)/boards/$id",
	});
	const mutation = useMutation(
		trpc.link.create.mutationOptions({
			onMutate: async (args, context) => {
				queryClient.cancelQueries({
					queryKey: trpc.board.byId.queryKey({
						id,
					}),
				});
				closeModal();
				const prevData = context.client.getQueryData(
					trpc.board.byId.queryKey({
						id,
					}),
				);

				if (prevData) {
					const newLink: SelectLink = {
						id: -1,
						publicId: generateUID(),
						boardId: Number(id),
						createdAt: new Date().toISOString(),
						updatedAt: null,
						deletedAt: null,
						url: args.url ?? "",
						title: args.url,
						description: args.description ?? null,
						imageUrl: null,
						favicon: null,
						domain: null,
						notes: null,
						isRead: false,
						isFavourite: false,
						createdBy: "optimistic-user",
					};
					context.client.setQueryData(
						trpc.board.byId.queryKey({
							id,
						}),
						(old) => {
							if (!old) return prevData;
							const updatedLinks = [...old.links, newLink];
							return {
								...old,
								links: updatedLinks,
							};
						},
					);
				}
				return { prevState: prevData };
			},
			onError: (_err, _newLink, context) => {
				queryClient.setQueryData(
					trpc.board.byId.queryKey({
						id,
					}),
					context?.prevState,
				);
				toast.error(_err.message);
			},
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.board.byId.queryKey({
						id,
					}),
				});
				toast.success(`${data?.title} has been created`);
			},
		}),
	);

	useEffect(() => {
		const nameElement: HTMLElement | null =
			document.querySelector<HTMLElement>("#link-url");
		if (nameElement) nameElement.focus();
	}, []);

	const form = useForm({
		defaultValues: {
			publicId: generateUID(),
			url: "",
		} as z.input<typeof InsertLink>,
		validators: {
			onDynamic: InsertLink,
			onDynamicAsyncDebounceMs: 300,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				...value,
				boardPublicId: id,
			});
		},
		onSubmitInvalid: ({ formApi }) => {
			const errorMap = formApi.state.errorMap.onDynamic;
			const firstErrorField = Object.keys(errorMap || {}).find(
				(name) => errorMap?.[name],
			);
			if (firstErrorField) {
				const input = document.querySelector(
					`input[name="${firstErrorField}"], button[name="${firstErrorField}"]`,
				) as HTMLInputElement | HTMLButtonElement | null;
				input?.focus();
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex h-full flex-col"
		>
			<div className="flex-1 space-y-6 overflow-y-auto">
				<div className="space-y-2">
					<form.Field name="url">
						{(field) => (
							<div className="flex flex-col gap-1">
								<Input
									id="url-input"
									name={field.name}
									placeholder="Url"
									type="text"
									value={field.state.value ?? ""}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={!!field.state.meta.errors.length}
								/>
								{field.state.meta.errors.map((error, _i) => (
									<p
										key={error?.message}
										className="mt-1 text-destructive text-sm"
									>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div className="flex justify-end gap-2 border-t px-6 py-4">
					<form.Subscribe
						selector={(state) => ({
							isSubmitting: state.isSubmitting,
							canSubmit: state.canSubmit,
							values: state.values,
						})}
					>
						{({ isSubmitting, canSubmit, values }) => (
							<>
								<Button
									variant="secondary"
									onClick={() => {
										closeModal();
										form.reset();
									}}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button
									disabled={isSubmitting || !canSubmit || !values.url.trim()}
								>
									{isSubmitting ? (
										<>
											<Spinner />
											Creating
										</>
									) : (
										"create"
									)}
								</Button>
							</>
						)}
					</form.Subscribe>
				</div>
			</div>
		</form>
	);
}
