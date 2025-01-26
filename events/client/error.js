const { useLogger } = require("@zibot/zihooks");
const { Events } = require("discord.js");

module.exports = {
	name: Events.Error,
	type: "events",
	/**
	 *
	 * @param { Error } error
	 */
	execute: async (error) => {
		useLogger().error(error.message);
	},
};
