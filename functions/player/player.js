const { useQueue } = require("discord-player");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const emoji = {
    UnLock: "<:UNlock:1167543715632521368>",
    Lock: "<:LOck:1167543711283019776>"
}
const CreateButton = ({ id = null, style = ButtonStyle.Secondary, label = null, emoji = null, disable = true }) => {
    const button = new ButtonBuilder()
        .setCustomId(`player_${id}`)
        .setStyle(style)
        .setDisabled(disable);
    if (label) button.setLabel(label);
    if (emoji) button.setEmoji(emoji)
    return button
}
const repeatMode = ["OFF", "TRACK", "QUEUE", "AUTOPLAY"]
module.exports = {
    data: { name: "player", type: "player" },
    execute: async (client, queue, tracks) => {
        const track = tracks ?? queue.currentTrack;
        const requestedBy = track?.requestedBy ?? queue.metadata.requestedBy;
        let code = {};
        const process = queue.node.createProgressBar({
        })
        const embed = new EmbedBuilder()
            .setDescription(`Đang phát: ${track.title}`)
            .setColor("Random")
            .setFooter({ text: `Đã thêm bởi: ${requestedBy.username}`, iconURL: requestedBy.displayAvatarURL({ size: 1024 }) })
            .setTimestamp()
            .setImage(track.thumbnail)
            .addFields({
                name: `${process}`,
                value: " "
            });
        if (queue.repeatMode !== 0)
            embed.addFields({ name: `Lặp lại: ${repeatMode[queue.repeatMode]}`, value: " ", inline: false })
        code.embeds = [embed]
        if (queue.node.isPlaying() || !queue.isEmpty()) {
            const button = new ActionRowBuilder().addComponents(
                CreateButton({ id: "volume", emoji: `🔉`, disable: false }),
                CreateButton({ id: "previous", label: "◁", disable: !queue?.history?.previousTrack }),
                CreateButton({ id: "pause", label: `${queue.node.isPlaying() ? "||" : "▶"}`, disable: false }),
                CreateButton({ id: "next", label: "▷", disable: false }),
                CreateButton({ id: "loop", label: `↺`, disable: false }),
            )
            const button2 = new ActionRowBuilder().addComponents(
                CreateButton({ id: "refresh", label: `⟳`, disable: false }),
                CreateButton({ id: "shuffle", label: `🔀`, disable: true }),
                CreateButton({ id: "search", emoji: `<:search:1150766173332443189>`, disable: false }),
                CreateButton({ id: "locks", emoji: `${emoji.Lock}`, disable: false }),
                CreateButton({ id: "stop", emoji: `⬜`, disable: false, style: ButtonStyle.Danger }),

            )

            code.components = [button, button2]
        }
        return code
    }
}
