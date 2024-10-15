const { useClient } = require("@zibot/zihooks");
const client = useClient();

module.exports = {
	name: "unhandledRejection",
	type: "process",
	execute: async (error) => {
		console.error("Unhandled promise rejection:", error);
		client?.errorLog(`Unhandled promise rejection: **${error.message}**`);
		client?.errorLog(error.stack);
	},
};
