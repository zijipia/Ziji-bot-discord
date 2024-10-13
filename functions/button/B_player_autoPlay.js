const { useMainPlayer, useQueue } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");
const player = useMainPlayer();

module.exports.data = {
	name: "B_player_autoPlay",
	type: "button",
};

/**
 * @param { object } button - object button
 * @param { import ("discord.js").ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
	const queue = useQueue(interaction.guild.id);
	if (!queue) return;
	queue.setRepeatMode(queue.repeatMode === 3 ? 0 : 3);
	if (queue.isPlaying()) return;
	const tracks = await this.getRelatedTracks(queue?.history?.previousTrack, queue?.history);

	if (!tracks?.at(0)?.url.length) return;

	const command = useFunctions().get("Search");
	await command.execute(interaction, tracks?.at(0)?.url, lang);
};

module.exports.getRelatedTracks = async (track, history) => {
	try {
		let tracks = (await track?.extractor?.getRelatedTracks(track, history))?.tracks || [];

		if (!tracks.length) {
			tracks =
				(
					await player.extractors.run(async (ext) => {
						const res = await ext.getRelatedTracks(track, history);
						return res.tracks.length ? res.tracks : false;
					})
				)?.result || [];
		}

		return tracks.filter((tr) => !history.tracks.some((t) => t.url === tr.url));
	} catch (e) {
		console.log(e);
		return [];
	}
};
