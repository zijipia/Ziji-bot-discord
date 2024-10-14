const { GuildQueue, Track, GuildQueueEvent } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");

const Functions = useFunctions();

async function SendNewMessenger(queue, playerGui) {
	queue.metadata.mess = await queue.metadata.channel.send(playerGui);
	return;
}

module.exports = {
	name: GuildQueueEvent.playerStart,
	type: "Player",
	/**
	 *
	 * @param { GuildQueue } queue
	 * @param { Track } track
	 * @returns
	 */
	execute: async (queue, track) => {
		const player_func = Functions.get("player_func");
		if (!player_func) return;

		const playerGui = await player_func.execute({ queue, track });

		// send messenger
		if (!queue.metadata.mess) {
			await SendNewMessenger(queue, playerGui);
			return;
		}
		// edit messenger
		await queue.metadata.mess.edit(playerGui).catch(async () => await SendNewMessenger(queue, playerGui));
		// lyrics

		const ZiLyrics = queue.metadata.ZiLyrics;
		if (ZiLyrics?.Active) {
			const Lyrics = Functions.get("Lyrics");
			if (!Lyrics) return;
			await Lyrics.execute(null, { type: "syncedLyrics", queue });
			return;
		}
	},
};
