const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = {
    name: "audioTracksAdd",
    type: "Player",
    execute: async (queue, track) => {
        const embed = new EmbedBuilder()
            .setDescription(`Đã thêm bài hát: ${track.title}`)
            .setColor("Random")
            .setFooter({ text: `Đã thêm bởi: ${queue.metadata.requestedBy.username}`, iconURL: queue.metadata.requestedBy.displayAvatarURL({ size: 1024 }) })
            .setTimestamp()
            .setThumbnail(track.thumbnail)

        return queue.metadata.channel.send({ embeds: [embed] })
    }
}