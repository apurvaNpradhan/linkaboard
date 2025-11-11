import Metascraper from "metascraper";
export const metascraper = Metascraper([
	require("metascraper-author")(),
	require("metascraper-date")(),
	require("metascraper-description")(),
	require("metascraper-image")(), // For cover
	require("metascraper-logo")(),
	require("metascraper-publisher")(),
	require("metascraper-title")(),
	require("metascraper-url")(),
]);
