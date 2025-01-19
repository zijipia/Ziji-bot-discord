const { GuildQueueEvent } = require("discord-player");
const Logger = require('../../startup/logger')
const logger = new Logger
module.exports = {
	name: GuildQueueEvent.error,
	type: "Player",
	/**
	 * @param { import('discord-player').GuildQueue } queue
	 * @param { Error } error
	 */

	execute: async (queue, error) => {
		queue.player.client?.errorLog("Player Error");
		queue.player.client?.errorLog(error.message);
		logger.error(error.stack);
	},
};
