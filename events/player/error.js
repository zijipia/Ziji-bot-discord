const { useLogger } = require("@zibot/zihooks");
const { GuildQueueEvent } = require("discord-player");

module.exports = {
	name: GuildQueueEvent.Error,
	type: "Player",
	/**
	 * @param { import('discord-player').GuildQueue } queue
	 * @param { Error } error
	 */

	execute: async (queue, error) => {
		queue.player.client?.errorLog("Player Error");
		queue.player.client?.errorLog(error.message);
		useLogger().error(error.stack);
	},
};
