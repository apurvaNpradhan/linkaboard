export const DEFAULT_PROJECT_STATUSES = [
	{
		name: "Backlog",
		type: "backlog",
		position: "a0",
		colorCode: "#B3B1AD",
		description: null,
	},
	{
		name: "Planned",
		type: "planned",
		position: "a1",
		colorCode: "#FFB454",
		description: null,
	},
	{
		name: "In Progress",
		type: "in_progress",
		position: "a2",
		colorCode: "#59C2FF",
		description: null,
	},
	{
		name: "Completed",
		type: "completed",
		position: "a3",
		colorCode: "#C2D94C",
		description: null,
	},
	{
		name: "Canceled",
		type: "canceled",
		position: "a4",
		colorCode: "#F07178",
		description: null,
	},
] as const;
