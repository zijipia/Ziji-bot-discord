const { useClient, useLogger } = require("@zibot/zihooks");
const client = useClient();

module.exports = {
	name: "uncaughtException",
	type: "process",
	execute: async (error) => {
		useLogger().error("Uncaught exception:", error);
		client?.errorLog(`Uncaught exception: **${error.message}**`);
		client?.errorLog(error.stack);
	},
};
