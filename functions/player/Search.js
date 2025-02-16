const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, BaseInteraction, AttachmentBuilder } = require("discord.js");
const { useMainPlayer, useQueue, GuildQueueEvent, Track } = require("discord-player");
const { useDB, useConfig, useLogger } = require("@zibot/zihooks");
const { ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const { Worker } = require("worker_threads");
const langdef = require("./../../lang/vi");
const player = useMainPlayer();
const ZiIcons = require("./../../utility/icon");
const config = useConfig();
const log = useLogger();
//====================================================================//

module.exports.data = {
	name: "Search",
	type: "player",
};

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
		const worker = new Worker("./utility/musicImage.js", {
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

//====================================================================//

/**
 * @param { BaseInteraction } interaction
 * @param { string } query
 * @param { langdef } lang
 */
module.exports.execute = async (interaction, query, lang, options = {}) => {
	const { client, guild, user } = interaction;
	const voiceChannel = interaction.member.voice?.channel;

	if (!isUserInVoiceChannel(voiceChannel, interaction, lang)) return;
	if (!isBotInSameVoiceChannel(guild, voiceChannel, interaction, lang)) return;
	if (!hasVoiceChannelPermissions(voiceChannel, client, interaction, lang)) return;

	await interaction.deferReply({ withResponse: true }).catch(() => {});
	const queue = useQueue(guild.id);

	if (validURL(query) || options?.joinvoice) {
		return handlePlayRequest(interaction, query, lang, options, queue);
	}

	return handleSearchRequest(interaction, query, lang);
};

//====================================================================//

function isUserInVoiceChannel(voiceChannel, interaction, lang) {
	if (!voiceChannel) {
		interaction.reply({
			content: lang?.music?.NOvoiceChannel ?? "Bạn chưa tham gia vào kênh thoại",
			ephemeral: true,
		});
		return false;
	}
	return true;
}

function isBotInSameVoiceChannel(guild, voiceChannel, interaction, lang) {
	const voiceMe = guild.members.me.voice?.channel;
	if (voiceMe && voiceMe.id !== voiceChannel.id) {
		interaction.reply({
			content: lang?.music?.NOvoiceMe ?? "Bot đã tham gia một kênh thoại khác",
			ephemeral: true,
		});
		return false;
	}
	return true;
}

function hasVoiceChannelPermissions(voiceChannel, client, interaction, lang) {
	const permissions = voiceChannel.permissionsFor(client.user);
	if (!permissions.has("Connect") || !permissions.has("Speak")) {
		interaction.reply({
			content: lang?.music?.NoPermission ?? "Bot không có quyền tham gia hoặc nói trong kênh thoại này",
			ephemeral: true,
		});
		return false;
	}
	return true;
}

//#region Play Request
async function handlePlayRequest(interaction, query, lang, options, queue) {
	try {
		if (!queue?.metadata) await interaction.editReply({ content: "<a:loading:1151184304676819085> Loading..." });
		const playerConfig = await getPlayerConfig(options, interaction);

		if (!!options?.joinvoice) {
			return joinVoiceChannel(interaction, queue, playerConfig, options, lang);
		}

		const res = await player.search(query, { requestedBy: interaction.user });
		await player.play(interaction.member.voice.channel, res, {
			nodeOptions: { ...playerConfig, metadata: await getQueueMetadata(queue, interaction, options, lang) },
			requestedBy: interaction.user,
		});

		await cleanUpInteraction(interaction, queue);
	} catch (e) {
		console.error(e);
		await handleError(interaction, lang);
	}
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

async function getPlayerConfig(options, interaction) {
	const playerConfig = { ...DefaultPlayerConfig, ...config?.PlayerConfig };
	if (options.assistant && config?.DevConfig?.VoiceExtractor) {
		playerConfig.selfDeaf = false;
	}
	if (playerConfig.volume === "auto") {
		const DataBase = useDB();
		playerConfig.volume =
			DataBase ?
				((await DataBase.ZiUser.findOne({ userID: interaction.user.id }))?.volume ?? DefaultPlayerConfig.volume)
			:	DefaultPlayerConfig.volume;
	}
	return playerConfig;
}

async function joinVoiceChannel(interaction, queue, playerConfig, options, lang) {
	const queues = player.nodes.create(interaction.guild, {
		...playerConfig,
		metadata: await getQueueMetadata(queue, interaction, options, lang),
	});
	try {
		if (!queues.connection) await queues.connect(interaction.member.voice.channelId, { deaf: true });
	} catch {
		return await interaction
			.editReply({
				content: lang?.music?.NoPermission ?? "Bot không có quyền tham gia hoặc nói trong kênh thoại này",
				ephemeral: true,
			})
			.catch(() => {});
	}
	// acquire task entry
	const entry = queues.tasksQueue.acquire();
	// wait for previous task to be released and our task to be resolved
	await entry.getTask();
	try {
		player.events.emit(
			GuildQueueEvent.PlayerStart,
			queues,
			new Track(player, {
				title: "Join Voice",
				url: config?.botConfig?.InviteBot,
				thumbnail: config?.botConfig?.Banner,
				duration: "0:00",
				author: "EDM",
				queryType: "ZiPlayer",
				metadata: { channel: interaction.channel, requestedBy: user },
				async requestMetadata() {
					return { channel: interaction.channel, requestedBy: user };
				},
			}),
		);
		// if (!queues.isPlaying()) await queues.node.play();
	} finally {
		queues.tasksQueue.release();
	}
	return;
}

async function getQueueMetadata(queue, interaction, options, lang) {
	return (
		queue?.metadata ?? {
			listeners: [interaction.user],
			channel: interaction.channel,
			requestedBy: interaction.user,
			LockStatus: false,
			voiceAssistance: options.assistant && config?.DevConfig?.VoiceExtractor,
			ZiLyrics: { Active: false },
			lang: lang || langdef,
			focus: options?.focus,
			mess: interaction?.customId !== "S_player_Search" ? await interaction.fetchReply() : interaction.message,
		}
	);
}

async function cleanUpInteraction(interaction, queue) {
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
}

async function handleError(interaction, lang) {
	const response = { content: lang?.music?.NOres ?? "❌ | Không tìm thấy bài hát", ephemeral: true };
	if (interaction.replied || interaction.deferred) {
		try {
			await interaction.editReply(response);
		} catch {
			const meess = await interaction.fetchReply();
			await meess.edit(response).catch(() => {});
		}
	} else {
		await interaction.reply(response).catch(() => {});
	}
	return;
}

//#endregion Play Request
//#region Search Track
async function handleSearchRequest(interaction, query, lang) {
	const results = await player.search(query, { searchEngine: config.PlayerConfig.QueryType });
	const tracks = filterTracks(results.tracks);

	if (!tracks.length) {
		return interaction
			.editReply({
				embeds: [new EmbedBuilder().setTitle("Không tìm thấy kết quả nào cho:").setDescription(`${query}`).setColor("Red")],
				components: [
					new ActionRowBuilder().addComponents(
						new ButtonBuilder().setCustomId("B_cancel").setEmoji("❌").setStyle(ButtonStyle.Secondary),
					),
				],
			})
			.catch(() => {});
	}

	return sendSearchResults(interaction, query, tracks, lang);
}

function filterTracks(tracks) {
	const uniqueTracks = [];
	const seenUrls = new Set();
	for (const track of tracks) {
		if (track.url.length < 100 && !seenUrls.has(track.url)) {
			uniqueTracks.push(track);
			seenUrls.add(track.url);
			if (uniqueTracks.length >= 20) break;
		}
	}
	return uniqueTracks;
}

async function sendSearchResults(interaction, query, tracks, lang) {
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
			return interaction.editReply({ embeds: [], components: [row], files: [attachment] }).catch(() => {});
		} catch (error) {
			console.error("Error building image:", error);
		}
	}
	const embed = new EmbedBuilder()
		.setTitle("Tìm kiếm kết quả:")
		.setDescription(`${query}`)
		.setColor(lang?.color || "Random")
		.addFields(
			tracks.map((track, i) => ({
				name: `${i + 1}: ${track.title.slice(0, 50)} \`[${track.duration}]\``.slice(0, 99),
				value: ` `,
				inline: false,
			})),
		);

	return interaction.editReply({ embeds: [embed], components: [row] }).catch(() => {});
}
//#endregion Search Track
