const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, BaseInteraction } = require("discord.js");
const { useMainPlayer, useQueue, Util } = require("discord-player");
const { ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const player = useMainPlayer()
const ZiIcons = require("./../../utility/icon");
//====================================================================//
function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}
//====================================================================//
/**
* @param { BaseInteraction } interaction
* @param { string } query
*/
module.exports.execute = async (interaction, query) => {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.reply({ content: "Bạn chưa tham gia vào kênh thoại" });
    const voiceMe = interaction.guild.members.cache.get(interaction.client.user.id).voice.channel;
    if (voiceMe && voiceMe.id !== voiceChannel.id) return interaction.reply({ content: "Bot đã tham gia một kênh thoại khác" });
    await interaction.deferReply({ fetchReply: true })
    const queue = useQueue(interaction.guild.id)
    if (validURL(query)) {
        if (!queue?.metadata) await interaction.editReply({ content: "Đang phát nhạc" })
        await player.play(voiceChannel, query, {
            nodeOptions: {
                selfDeaf: true,
                volume: 100,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 5000,
                leaveOnEnd: true,
                leaveOnEndCooldown: 500000,
                metadata: queue?.metadata ?? {
                    channel: interaction.channel,
                    requestedBy: interaction.user,
                    LockStatus: false,
                    mess: await interaction.fetchReply(),
                }
            }
        })
        if (queue?.metadata) return interaction.deleteReply().catch(e => { })
        return;
    }
    const results = await player.search(query, {
        fallbackSearchEngine: "youtube"
    })
    const tracks = results.tracks.filter(t => t.url.length < 100).slice(0, 20)
    if (!tracks.length) return interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Không tìm thấy kết quả nào cho:")
                .setDescription(`${query}`)
                .setColor("Red")
        ],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("cancel")
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Secondary)
            )
        ]
    });
    const creator_Track = tracks.map((track, i) => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(`${i + 1}: ${track.title}`.slice(0, 99))
            .setDescription(`Duration: ${(track.duration)} source: ${(track.queryType)}`)
            .setValue(`${track.url}`)
            .setEmoji(`${ZiIcons.Playbutton}`)
    })
    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("player_SelectionTrack")
            .setPlaceholder("▶ | Chọn một bài hát để phát")
            .addOptions(creator_Track)
            .setMaxValues(1)
            .setMinValues(1)
    )
    const embed = new EmbedBuilder()
        .setTitle("Tìm kiếm kết quả:")
        .setDescription(`${query}`)
        .setColor("Random")
        .addFields(tracks.map((track, i) => ({
            name: `${i + 1}: ${track.title.slice(0, 50)} \`[${(track.duration)}]\``.slice(0, 99),
            value: ` `,
            inline: false
        })))
    return interaction.editReply({ embeds: [embed], components: [row] })
}
//====================================================================//
module.exports.data = {
    name: "Search",
    type: "player",
}