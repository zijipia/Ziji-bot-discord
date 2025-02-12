const { GuildQueueEvent } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");

module.exports = {
	name: GuildQueueEvent.EmptyQueue,
	type: "Player",
	execute: async (queue) => {
		const player = useFunctions().get("player_func");
		if (!player) return;
		const res = await player.execute({ queue });
		if (queue.metadata.mess) return queue.metadata.mess.edit(res);
	},
};
