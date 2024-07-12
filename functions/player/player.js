const { useMainPlayer, GuildQueue } = require("discord-player");
const player = useMainPlayer();
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Client } = require("discord.js");
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
const cteate_Related = async (track, history) => {
    try {
        let tracks = (await track.extractor?.getRelatedTracks(track, history))?.tracks || (await player.extractors.run(async (ext) => {
            const res = await ext.getRelatedTracks(track, history);
            if (!res.tracks.length) {
                return false;
            }
            return res.tracks;
        }))?.result || [];

        if (!tracks.length) tracks = (await player.extractors.run(async (ext) => {
            const res = await ext.getRelatedTracks(track, history);
            if (!res.tracks.length) {
                return false;
            }
            return res.tracks;
        }))?.result || [];

        const unique = tracks.filter((tr) => !history.tracks.find((t) => t.url === tr.url));
        if (unique.length) return unique;
        return [];
    } catch (e) {
        console.log(e);
        return [];
    }
}
const repeatMode = ["OFF", "TRACK", "QUEUE", "AUTOPLAY"]
module.exports = {
    data: { name: "player", type: "player" },
    /**
     * 
     * @param {Client} client 
     * @param {GuildQueue} queue 
     * @returns 
     */
    execute: async (client, queue, tracks) => {
        const track = tracks ?? queue.currentTrack;
        const requestedBy = track?.requestedBy ?? queue.metadata.requestedBy;
        let code = {};
        const process = queue.node.createProgressBar({
            leftChar: "﹏",
            rightChar: "﹏",
            indicator: "𓊝"
        })
        const embed = new EmbedBuilder()
            .setDescription(`Đang phát: **[${track.title}](${track.url})**
                Volume: **${queue.node.volume}** % `)
            .setColor("Random")
            .setFooter({ text: `Đã thêm bởi: ${requestedBy.username}`, iconURL: requestedBy.displayAvatarURL({ size: 1024 }) })
            .setTimestamp()
            .setImage(track.thumbnail)
            .addFields({
                name: " ",
                value: `${process}`
            });
        if (queue.repeatMode !== 0)
            embed.addFields({ name: `Lặp lại: ${repeatMode[queue.repeatMode]}`, value: " ", inline: false })
        code.embeds = [embed]
        if (queue.node.isPlaying() || !queue.isEmpty()) {
            const RelatedTracks = await cteate_Related(track, queue?.history);
            const _RelatedTracks = RelatedTracks.filter(t => t.url.length < 100).slice(0, 20)
            const creator_Track = _RelatedTracks.map((track, i) => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(`${i + 1}: ${track.title}`.slice(0, 99))
                    .setDescription(`Duration: ${(track.duration)} source: ${(track.queryType)}`)
                    .setValue(`${track.url}`)
                    .setEmoji("<:Playbutton:1230129096160182322>")
            })
            const RelatedTracksrow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("player_SelectionTrack")
                    .setPlaceholder("▶ | Chọn một bài hát để thêm vào hàng đợi")
                    .addOptions(creator_Track)
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setDisabled(!creator_Track.length)
            )

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

            code.components = [RelatedTracksrow, button, button2]
        }
        return code
    }
}
