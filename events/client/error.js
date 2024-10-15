const { Events } = require("discord.js");

module.exports = {
	name: Events.Error,
	type: "events",
	/**
	 *
	 * @param { Error } error
	 */
	execute: async (error) => {
		console.log(error.message);
	},
};
