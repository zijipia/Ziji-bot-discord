const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = {
    name: "audioTracksAdd",
    type: "Player",
    execute: async (queue, track) => {
        const embed = new EmbedBuilder()
            .setDescription(`Đã thêm danh sách phát: [${track[0]?.playlist?.title}](${track[0]?.playlist?.url})`)
            .setThumbnail(track?.thumbnail)
            .setColor("Random")
            .setTimestamp()
        const replied = await queue.metadata?.channel?.send({ embeds: [embed], fetchReply: true }).catch(e => { });
        setTimeout(function () {
            replied.delete().catch(e => { })
        }, 5000)
    }
}