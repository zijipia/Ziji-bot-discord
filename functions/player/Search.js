const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, BaseInteraction, AttachmentBuilder } = require("discord.js");
const { useMainPlayer, useQueue } = require("discord-player");
const { useDB } = require("@zibot/zihooks");
const { ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const { Worker } = require("worker_threads");
const langdef = require("./../../lang/vi");
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
		const worker = new Worker("./utility/worker.js", {
			workerData: { searchPlayer, query },
		});

		worker.on("message", (arrayBuffer) => {
			try {
				const buffer = Buffer.from(arrayBuffer);
				if (!Buffer.isBuffer(buffer)) {
					throw new Error("Received data is not a buffer");
				}
				const attachment = new AttachmentBuilder(buffer, { name: "search.png" });
				resolve(attachment);
			} catch (error) {
				reject(error);
			} finally {
				worker.postMessage("terminate");
			}
		});

		worker.on("error", reject);

		worker.on("exit", (code) => {
			if (code !== 0) {
				reject(new Error(`Worker stopped with exit code ${code}`));
			}
		});
	});
}

const DefaultPlayerConfig = {
	selfDeaf: true,
	volume: 100,
	leaveOnEmpty: true,
	leaveOnEmptyCooldown: 50_000,
	leaveOnEnd: true,
	leaveOnEndCooldown: 500_000,
	pauseOnEmpty: true,
};
//====================================================================//
/**
 * @param { BaseInteraction } interaction
 * @param { string } query
 * @param { langdef } lang
 */
module.exports.execute = async (interaction, query, lang, options = {}) => {
	const { client, guild, user } = interaction;
	const voiceChannel = interaction.member.voice.channel;
	if (!voiceChannel) {
		return interaction.reply({
			content: lang?.music?.NOvoiceChannel ?? "Bạn chưa tham gia vào kênh thoại",
			ephemeral: true,
		});
	}
	const voiceMe = guild.members.cache.get(client.user.id).voice.channel;
	if (voiceMe && voiceMe.id !== voiceChannel.id) {
		return interaction.reply({
			content: lang?.music?.NOvoiceMe ?? "Bot đã tham gia một kênh thoại khác",
			ephemeral: true,
		});
	}
	const permissions = voiceChannel.permissionsFor(client.user);
	if (!permissions.has("Connect") || !permissions.has("Speak")) {
		return interaction.reply({
			content: lang?.music?.NoPermission ?? "Bot không có quyền tham gia hoặc nói trong kênh thoại này",
			ephemeral: true,
		});
	}

	await interaction.deferReply({ fetchReply: true }).catch((e) => {});
	const queue = useQueue(guild.id);
	if (validURL(query)) {
		try {
			if (!queue?.metadata) await interaction.editReply({ content: "<a:loading:1151184304676819085> Loading..." });
			const res = await player.search(query, {
				requestedBy: user,
			});
			const playerConfig = { ...DefaultPlayerConfig, ...config?.PlayerConfig };
			if (options.assistant && config?.voiceAssistance) {
				playerConfig.selfDeaf = false;
			}

			if (playerConfig.volume === "auto") {
				const DataBase = useDB();
				playerConfig.volume =
					DataBase ?
						((await DataBase.ZiUser.findOne({ userID: user.id }))?.volume ?? DefaultPlayerConfig.volume)
					:	DefaultPlayerConfig.volume;
			}
			await player.play(voiceChannel, res, {
				nodeOptions: {
					...playerConfig,
					metadata: queue?.metadata ?? {
						channel: interaction.channel,
						requestedBy: user,
						LockStatus: false,
						voiceAssistance: options.assistant && config?.voiceAssistance,
						ZiLyrics: { Active: false },
						lang: lang || langdef,
						mess: interaction?.customId !== "S_player_Search" ? await interaction.fetchReply() : interaction.message,
					},
				},
				requestedBy: interaction.user,
			});

			if (queue?.metadata) {
				if (interaction?.customId === "S_player_Search") {
					await interaction.message.delete().catch(() => {});
				}
				await interaction.deleteReply().catch(() => {});
			} else {
				if (interaction?.customId === "S_player_Search") {
					await interaction.deleteReply().catch(() => {});
				}
			}
			return;
		} catch (e) {
			console.error(e);
			const response = {
				content: lang?.music?.NOres ?? "❌ | Không tìm thấy bài hát",
				ephemeral: true,
			};
			if (interaction.replied || interaction.deferred) {
				try {
					await interaction.editReply(response);
				} catch {
					const meess = await interaction.fetchReply();
					await meess.edit(response);
				}
			} else {
				await interaction.reply(response);
			}
			return;
		}
	}

	const results = await player.search(query, {
		fallbackSearchEngine: "youtube",
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
			embeds: [new EmbedBuilder().setTitle("Không tìm thấy kết quả nào cho:").setDescription(`${query}`).setColor("Red")],
			components: [
				new ActionRowBuilder().addComponents(
					new ButtonBuilder().setCustomId("B_cancel").setEmoji("❌").setStyle(ButtonStyle.Secondary),
				),
			],
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
		.setValue("B_cancel")
		.setEmoji(ZiIcons.noo);

	const row = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId("S_player_Search")
			.setPlaceholder("▶ | Chọn một bài hát để phát")
			.addOptions([cancelOption, ...creator_Track])
			.setMaxValues(1)
			.setMinValues(1),
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
			console.error("Error building image:", error);
		}
	}
	const embed = new EmbedBuilder()
		.setTitle("Tìm kiếm kết quả:")
		.setDescription(`${query}`)
		.setColor("Random")
		.addFields(
			tracks.map((track, i) => ({
				name: `${i + 1}: ${track.title.slice(0, 50)} \`[${track.duration}]\``.slice(0, 99),
				value: ` `,
				inline: false,
			})),
		);

	return interaction.editReply({ embeds: [embed], components: [row] });
};

//====================================================================//
module.exports.data = {
	name: "Search",
	type: "player",
};
