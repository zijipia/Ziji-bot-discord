const { EmbedBuilder } = require("discord.js");
const { GuildQueueEvent } = require("discord-player");

module.exports = {
	name: GuildQueueEvent.AudioTrackAdd,
	type: "Player",
	execute: async (queue, track) => {
		if (track?.queryType === "tts") return;
		const embed = new EmbedBuilder()
			.setDescription(`Đã thêm bài hát: [${track.author} - ${track?.title}](${track?.url}) \`[${track?.duration}]\``)
			.setThumbnail(track?.thumbnail)
			.setColor("Random")
			.setTimestamp()
			.setFooter({
				text: `by: ${track?.requestedBy?.username}`,
				iconURL: track?.requestedBy?.displayAvatarURL({ size: 1024 }) ?? null,
			});
		const replied = await queue.metadata?.channel?.send({ embeds: [embed], fetchReply: true }).catch((e) => {});
		setTimeout(function () {
			replied?.delete().catch((e) => {});
		}, 5000);
	},
};
