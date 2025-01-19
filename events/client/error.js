const { Events } = require("discord.js");
const Logger = require('../../startup/logger')
const logger = new Logger
module.exports = {
	name: Events.Error,
	type: "events",
	/**
	 *
	 * @param { Error } error
	 */
	execute: async (error) => {
		logger.error(error.message);
	},
};
