const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = {
    name: "playerSkip",
    type: "Player",
    execute: async (queue, track) => {
        const embed = new EmbedBuilder()
            .setDescription(`Đã Skip: [${track?.title}](${track?.url}) \`[${track?.duration}]\``)
            .setThumbnail(track?.thumbnail)
            .setColor("Random")
        return queue.metadata.channel.send({ embeds: [embed] }).catch(e => { })

    }
}