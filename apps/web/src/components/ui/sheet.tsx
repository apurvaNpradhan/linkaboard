import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Maximize2Icon, Minimize2Icon, XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Core Sheet components (unchanged except for the new maximize logic)      */
/* -------------------------------------------------------------------------- */

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
	return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
	return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
	return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
	return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
	return (
		<SheetPrimitive.Overlay
			data-slot="sheet-overlay"
			className={cn(
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in",
				className,
			)}
			{...props}
		/>
	);
}

/* -------------------------------------------------------------------------- */
/*  SheetContent – now accepts a `maximized` flag via context                */
/* -------------------------------------------------------------------------- */

type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> & {
	side?: "top" | "right" | "bottom" | "left";
	/** Optional children that can read the maximized state */
	children?:
		| React.ReactNode
		| ((ctx: { maximized: boolean; toggle: () => void }) => React.ReactNode);
};

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
	({ className, children, side = "right", ...props }, ref) => {
		/* ----- internal maximize state (per-sheet) ----- */
		const [maximized, setMaximized] = React.useState(false);
		const toggle = () => setMaximized((v) => !v);

		const ctx = { maximized, toggle };

		return (
			<SheetPortal>
				<SheetOverlay />
				<SheetPrimitive.Content
					ref={ref}
					data-slot="sheet-content"
					className={cn(
						"fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-300 data-[state=open]:duration-500",
						side === "right" &&
							"inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
						side === "left" &&
							"inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
						side === "top" && "inset-x-0 top-0 h-auto border-b",
						side === "bottom" && "inset-x-0 bottom-0 h-auto border-t",
						side === "right" &&
							!maximized && [
								"data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
							],
						side === "right" &&
							maximized && [
								"data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
							],

						side === "left" &&
							!maximized && [
								"data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
							],
						side === "left" &&
							maximized && [
								"data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full",
							],

						side === "top" && [
							"data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
						],
						side === "bottom" && [
							"data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
						],

						maximized && "!w-full !h-full !max-w-none inset-0",
						className,
					)}
					{...props}
				>
					{typeof children === "function" ? children(ctx) : children}

					<SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
						<XIcon className="size-4" />
						<span className="sr-only">Close</span>
					</SheetPrimitive.Close>
					<SheetMaximizeButton {...ctx} />
				</SheetPrimitive.Content>
			</SheetPortal>
		);
	},
);
SheetContent.displayName = "SheetContent";

type SheetMaximizeButtonProps = {
	maximized: boolean;
	toggle: () => void;
};

function SheetMaximizeButton({ maximized, toggle }: SheetMaximizeButtonProps) {
	return (
		<button
			type="button"
			onClick={toggle}
			className="absolute top-4 right-12 rounded-xs p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-secondary"
			aria-label={maximized ? "Minimize sheet" : "Maximize sheet"}
		>
			{maximized ? (
				<Minimize2Icon className="size-4" />
			) : (
				<Maximize2Icon className="size-4" />
			)}
			<span className="sr-only">{maximized ? "Minimize" : "Maximize"}</span>
		</button>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-header"
			className={cn("flex flex-col gap-1.5 p-4", className)}
			{...props}
		/>
	);
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn("mt-auto flex flex-col gap-2 p-4", className)}
			{...props}
		/>
	);
}

function SheetTitle({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
	return (
		<SheetPrimitive.Title
			data-slot="sheet-title"
			className={cn("font-semibold text-foreground", className)}
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
	return (
		<SheetPrimitive.Description
			data-slot="sheet-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
	SheetMaximizeButton,
};
