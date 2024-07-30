const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonInteraction } = require("discord.js");
const { useMainPlayer, useQueue, Util, GuildQueue } = require("discord-player");
const { ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const player = useMainPlayer()
const ZiIcons = require("./../../utility/icon");
/**
* @param { ButtonInteraction } interaction
* @param {GuildQueue} queue
*/
module.exports.execute = async (interaction, queue, Nextpage = true) => {
    if (!queue) return interaction.reply({ content: "There is no music playing in this server" });
    await interaction.deferReply();
    const fieldName = interaction?.message?.embeds?.at(0).data?.fields?.at(0)
    const mainRequire = fieldName.value.includes("﹏");
    const pageData = fieldName.name.replace("Page:", " ").trim().split("/")
    const queuetrack = [];
    queue.tracks.map(async (track, i) => {
        queuetrack.push({
            title: track?.title,
            url: track?.url,
            duration: track?.duration
        })
    })
    if (!queuetrack.length) {
        if (!mainRequire)
            return interaction.message.delete().catch(e => console.log);
        return interaction.editReply({ content: "There is no music playing in this server" });
    }
    let page = eval(pageData?.at(0) || 1);
    const toltalPage = Math.ceil(queuetrack.length / 20)
    if (!mainRequire) {
        if (Nextpage) {
            page = (page % toltalPage) + 1;
        } else {
            page = (page - 1) < 1 ? toltalPage : (page - 1);
        }
    }
    const currentIndex = (page - 1) * 20
    let now = page * 20 - 20
    const currentTrack = queuetrack.slice(currentIndex, currentIndex + 20);
    if (!currentTrack && !currentTrack.length) return;
    const embed = new EmbedBuilder()
        .setTitle(`${ZiIcons.queue} Queue of ${interaction.guild.name}`)
        .setColor("Random")
        .addFields({ name: `Page: ${page} / ${toltalPage}`, value: " " })
        .setDescription(`${currentTrack.map((track) => `${++now} | **${track.title}** - [${track.duration}](${track.url})`).join("\n")
            }`)
    const queueFund = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("queue_clear")
            .setLabel("Clear All")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("queue_del")
            .setEmoji("🗑️")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("queue_Shuffle")
            .setEmoji(ZiIcons.shuffle)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("cancel")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Secondary),

    )
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("queue_Page")
            .setLabel("Page:")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId("queue_prev")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("◀"),
        new ButtonBuilder()
            .setCustomId("queue_next")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("▶")
    )
    if (mainRequire)
        return interaction.editReply({ content: "", embeds: [embed], components: [queueFund, row] });
    interaction.deleteReply().catch(e => { });
    interaction.message.edit({ content: "", embeds: [embed], components: [queueFund, row] });
    return

}
//====================================================================//
module.exports.data = {
    name: "Queue",
    type: "player",
}
//Page: 3 / 10