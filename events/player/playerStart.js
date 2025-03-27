const { GuildQueue, Track, GuildQueueEvent } = require("discord-player");
const { useFunctions, useConfig } = require("@zibot/zihooks");

const Functions = useFunctions();
const config = useConfig();
async function SendNewMessenger(queue, playerGui) {
	queue.metadata.mess = await queue.metadata.channel.send(playerGui);
	return;
}

module.exports = {
	name: GuildQueueEvent.PlayerStart,
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

		const playerGui = await player_func.execute({ queue, tracks: track });

		// send message
		if (!queue.metadata.mess) {
			await SendNewMessenger(queue, playerGui);
			return;
		}
		// edit message
		await queue.metadata.mess.edit(playerGui).catch(async () => await SendNewMessenger(queue, playerGui));

		// Status of voice channel
		if (config.PlayerConfig?.changeStatus) {
			const status = `💿 Now playing: ${track.cleanTitle}`;
			const { rest } = queue.player.client;
			rest.put(`/channels/${queue?.channel?.id}/voice-status`, { body: { status } }).catch((e) => {
				console.log(e);
			});
		}
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
