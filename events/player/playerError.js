const { GuildQueueEvent } = require("discord-player");

module.exports = {
	name: GuildQueueEvent.PlayerError,
	type: "Player",

	/**
	 * @param { import('discord-player').GuildQueue } queue
	 * @param { Error } error
	 * @param { import('discord-player').Track } track
	 */

	execute: async (queue, error, track) => {
		queue.player.client?.errorLog("**Player playerError**");
		queue.player.client?.errorLog(error.message);
		queue.player.client?.errorLog(track.url);
		console.log(error.stack);
	},
};
