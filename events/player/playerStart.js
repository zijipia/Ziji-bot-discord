const { GuildQueue, Track, GuildQueueEvent, useMainPlayer } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");
const { default: axios } = require('axios')

const Functions = useFunctions();

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
		const channelId = queue.channel.id;
		const status = `💿 Now playing: ${track.cleanTitle}`;
		try {
			await axios.put(`https://discord.com/api/v10/channels/${channelId}/voice-status`,
				{ status: status },
				{ headers: { Authorization: `Bot ${process.env.TOKEN}` }}
			)
		} catch (err) {
			console.error(err);
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
