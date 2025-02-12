const { GuildQueueEvent } = require("discord-player");

module.exports = {
	name: GuildQueueEvent.EmptyChannel,
	type: "Player",
	execute: async (queue) => {
		if (queue.metadata.mess) return queue.metadata.mess.edit({ components: [] }).catch((e) => {});
	},
};
