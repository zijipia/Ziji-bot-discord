const { EmbedBuilder, Message } = require("discord.js");
const config = require("../config");
Message
module.exports = {
    name: "audioTrackAdd",
    type: "Player",
    execute: async (queue, track) => {
        const embed = new EmbedBuilder()
            .setDescription(`Đã thêm bài hát: ${track?.title}`)
            .setColor("Random")
            .setTimestamp()
            .setThumbnail(track?.thumbnail)
        return queue.metadata?.channel?.send({ embeds: [embed] })
    }
}