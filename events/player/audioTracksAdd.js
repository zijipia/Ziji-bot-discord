const { EmbedBuilder } = require("discord.js");
const { GuildQueueEvent } = require("discord-player");

module.exports = {
	name: GuildQueueEvent.AudioTracksAdd,
	type: "Player",
	execute: async (queue, track) => {
		if (track?.queryType === "tts") return;
		const embed = new EmbedBuilder()
			.setDescription(
				`Đã thêm danh sách phát: [${track[0]?.playlist?.title || "Không có tiêu đề"}](${track[0]?.playlist?.url || `https://soundcloud.com`})`,
			)
			.setThumbnail(track[0]?.playlist?.thumbnail || null)
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
