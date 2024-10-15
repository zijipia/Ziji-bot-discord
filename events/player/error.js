const { GuildQueueEvent } = require("discord-player");

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
		console.log(error.stack);
	},
};
