import type React from "react";
import { cn } from "@/lib/utils";

const Container = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"mx-auto flex w-full max-w-4xl flex-1 flex-col space-y-5",
				className,
			)}
		>
			{children}
		</div>
	);
};

export default Container;
