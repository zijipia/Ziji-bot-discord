const config = require("../config");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "playerStart",
    execute: async (client, queue, track) => {
        const embed = new EmbedBuilder()
            .setDescription(`Đang phát: ${track.title}`)
            .setColor("Random")
            .setFooter({ text: `Đã thêm bởi: ${queue.metadata.requestedBy.username}`, iconURL: queue.metadata.requestedBy.displayAvatarURL({ size: 1024 }) })
            .setTimestamp()
            .setImage(track.thumbnail)

        return queue.metadata.channel.send({ embeds: [embed] })
    }
}
