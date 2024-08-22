const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, BaseInteraction, AttachmentBuilder } = require("discord.js");
const { useMainPlayer, useQueue } = require("discord-player");
const { ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const { Worker } = require('worker_threads');
const langdef = require("./../../lang/vi")
const player = useMainPlayer();
const ZiIcons = require("./../../utility/icon");
const config = require("../../config");

//====================================================================//

function validURL(str) {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}

async function buildImageInWorker(searchPlayer, query) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./utility/worker.js', {
            workerData: { searchPlayer, query }
        });

        worker.on('message', (arrayBuffer) => {
            try {
                const buffer = Buffer.from(arrayBuffer);
                if (!Buffer.isBuffer(buffer)) {
                    throw new Error('Received data is not a buffer');
                }
                const attachment = new AttachmentBuilder(buffer, { name: 'search.png' });
                resolve(attachment);
            } catch (error) {
                reject(error);
            } finally {
                worker.postMessage('terminate');
            }
        });

        worker.on('error', reject);

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

//====================================================================//
/**
* @param { BaseInteraction } interaction
* @param { string } query
* @param { langdef } lang
*/
module.exports.execute = async (interaction, query, lang) => {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
        return interaction.reply({ content: lang?.Search?.NOvoiceChannel ?? "Bạn chưa tham gia vào kênh thoại" });
    }
    const voiceMe = interaction.guild.members.cache.get(interaction.client.user.id).voice.channel;
    if (voiceMe && voiceMe.id !== voiceChannel.id) {
        return interaction.reply({ content: lang?.Search?.NOvoiceChannel ?? "Bot đã tham gia một kênh thoại khác" });
    }

    await interaction.deferReply({ fetchReply: true });
    const queue = useQueue(interaction.guild.id);
    if (validURL(query)) {
        try {
            if (!queue?.metadata) await interaction.editReply({ content: "<a:loading:1151184304676819085> Loading..." });
            const res = await player.search(query, {
                requestedBy: interaction.user,
            })
            await player.play(voiceChannel, res, {
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
                        mess: interaction?.customId !== "player_SelectionSearch" ? await interaction.fetchReply() : interaction.message,
                    }
                }
            });

            if (queue?.metadata) {
                if (interaction?.customId === "player_SelectionSearch") {
                    await interaction.message.delete().catch(() => { });
                }
                await interaction.deleteReply().catch(() => { });
            } else {
                if (interaction?.customId === "player_SelectionSearch") {
                    await interaction.deleteReply().catch(() => { });
                }
            }
            return;
        } catch (e) {
            console.error(e);
            const response = { content: lang?.Search?.NOres ?? '❌ | Không tìm thấy bài hát', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                try {
                    await interaction.editReply(response);
                } catch {
                    const meess = await interaction.fetchReply()
                    await meess.edit(response);
                }

            } else {
                await interaction.reply(response);
            }
            return;
        }
    }

    const results = await player.search(query, {
        fallbackSearchEngine: "youtube"
    });

    const tracks = [];
    const seenUrls = new Set();

    for (const track of results.tracks) {
        if (track.url.length < 100 && !seenUrls.has(track.url)) {
            tracks.push(track);
            seenUrls.add(track.url);

            if (tracks.length >= 20) {
                break;
            }
        }
    }

    if (!tracks.length) {
        return interaction.editReply({
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
    }

    const creator_Track = tracks.map((track, i) => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(`${i + 1}: ${track.title}`.slice(0, 99))
            .setDescription(`Duration: ${track.duration} source: ${track.queryType}`)
            .setValue(`${track.url}`)
            .setEmoji(`${ZiIcons.Playbutton}`);
    });

    const cancelOption = new StringSelectMenuOptionBuilder()
        .setLabel("Hủy")
        .setDescription("Hủy bỏ")
        .setValue("cancel")
        .setEmoji(ZiIcons.noo);

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("player_SelectionSearch")
            .setPlaceholder("▶ | Chọn một bài hát để phát")
            .addOptions([cancelOption, ...creator_Track])
            .setMaxValues(1)
            .setMinValues(1)
    );

    if (config?.ImageSearch) {
        const searchPlayer = tracks.map((track, i) => ({
            index: i + 1,
            avatar: track?.thumbnail,
            displayName: track.title.slice(0, tracks.length > 1 ? 30 : 80),
            time: track.duration,
        }));

        try {
            const attachment = await buildImageInWorker(searchPlayer, query);
            return interaction.editReply({ embeds: [], components: [row], files: [attachment] });
        } catch (error) {
            console.error('Error building image:', error);
        }
    }
    const embed = new EmbedBuilder()
        .setTitle("Tìm kiếm kết quả:")
        .setDescription(`${query}`)
        .setColor("Random")
        .addFields(tracks.map((track, i) => ({
            name: `${i + 1}: ${track.title.slice(0, 50)} \`[${track.duration}]\``.slice(0, 99),
            value: ` `,
            inline: false
        })));

    return interaction.editReply({ embeds: [embed], components: [row] });
};

//====================================================================//
module.exports.data = {
    name: "Search",
    type: "player",
};