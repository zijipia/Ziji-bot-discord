const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, BaseInteraction, AttachmentBuilder } = require("discord.js");
const { useMainPlayer, useQueue, GuildQueueEvent, Track } = require("discord-player");
const { useDB, useConfig, useLogger } = require("@zibot/zihooks");
const { ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const { Worker } = require("worker_threads");
const langdef = require("./../../lang/vi");
const player = useMainPlayer();
const ZiIcons = require("./../../utility/icon");
const config = useConfig();
const logger = useLogger();
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
	logger.debug("Starting buildImageInWorker");
	return new Promise((resolve, reject) => {
		logger.debug("Creating new worker thread");
		const worker = new Worker("./utility/musicImage.js", {
			workerData: { searchPlayer, query },
		});

		worker.on("message", (arrayBuffer) => {
			logger.debug("Received message from worker");
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
			logger.debug("Message processed successfully");
		});

		worker.on("error", (error) => {
			logger.error(`Worker encountered an error: ${JSON.stringify(error)}`);
			reject(error);
		});

		worker.on("exit", (code) => {
			logger.debug(`Worker exited with code ${code}`);
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
	logger.debug(`Executing command with query: ${JSON.stringify(query)}`);
	const { client, guild, user } = interaction;
	const voiceChannel = interaction.member.voice?.channel;

	if (!isUserInVoiceChannel(voiceChannel, interaction, lang)) return;
	if (!isBotInSameVoiceChannel(guild, voiceChannel, interaction, lang)) return;
	if (!hasVoiceChannelPermissions(voiceChannel, client, interaction, lang)) return;

	await interaction.deferReply({ withResponse: true }).catch(() => {
		logger.warn("Failed to defer reply");
	});
	const queue = useQueue(guild.id);
	logger.debug(`Queue retrieved: ${queue?.tracks?.length || 0} tracks`);

	if (validURL(query) || options?.joinvoice) {
		logger.debug("Handling play request");
		return handlePlayRequest(interaction, query, lang, options, queue);
	}

	logger.debug("Handling search request");
	return handleSearchRequest(interaction, query, lang);
};

//====================================================================//

function isUserInVoiceChannel(voiceChannel, interaction, lang) {
	if (!voiceChannel) {
		logger.debug("User is not in a voice channel");
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
		logger.debug("Bot is not in the same voice channel");

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
		logger.debug("Bot lacks necessary permissions in the voice channel");
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
		logger.debug(`Player configuration retrieved:  ${JSON.stringify(playerConfig)}`);

		if (!!options?.joinvoice) {
			return joinVoiceChannel(interaction, queue, playerConfig, options, lang);
		}

		const res = await player.search(query, { requestedBy: interaction.user });
		logger.debug("Search results obtained:", res);
		await player.play(interaction.member.voice.channel, res, {
			nodeOptions: { ...playerConfig, metadata: await getQueueMetadata(queue, interaction, options, lang) },
			requestedBy: interaction.user,
		});

		await cleanUpInteraction(interaction, queue);
		logger.debug("Track played successfully");
	} catch (e) {
		logger.error(`Error in handlePlayRequest:  ${JSON.stringify(e)}`);
		await handleError(interaction, lang);
	}
}

const DefaultPlayerConfig = {
	selfDeaf: true,
	volume: 50,
	leaveOnEmpty: true,
	leaveOnEmptyCooldown: 50_000,
	leaveOnEnd: true,
	leaveOnEndCooldown: 500_000,
	pauseOnEmpty: true,
};

async function getPlayerConfig(options, interaction) {
	logger.debug("Starting getPlayerConfig");
	const playerConfig = { ...DefaultPlayerConfig, ...config?.PlayerConfig };

	if (options.assistant && config?.DevConfig?.VoiceExtractor) {
		logger.debug("Disabling selfDeaf due to assistant option");
		playerConfig.selfDeaf = false;
	}

	if (playerConfig.volume === "auto") {
		logger.debug("Volume is set to auto, fetching from database");
		const DataBase = useDB();
		playerConfig.volume =
			DataBase ?
				((await DataBase.ZiUser.findOne({ userID: interaction.user.id }))?.volume ?? DefaultPlayerConfig.volume)
			:	DefaultPlayerConfig.volume;
		logger.debug(`Volume set from database or default: ${playerConfig.volume}`);
	}

	logger.debug(`Exiting getPlayerConfig with playerConfig: ${JSON.stringify(playerConfig)}`);
	return playerConfig;
}

async function joinVoiceChannel(interaction, queue, playerConfig, options, lang) {
	logger.debug("Starting joinVoiceChannel function");
	const queues = player.nodes.create(interaction.guild, {
		...playerConfig,
		metadata: await getQueueMetadata(queue, interaction, options, lang),
	});
	logger.debug("Queue created with metadata:", JSON.stringify(queues.metadata));

	try {
		if (!queues.connection) {
			logger.debug("No existing connection, attempting to connect to voice channel");
			await queues.connect(interaction.member.voice.channelId, { deaf: true });
			logger.debug("Connected to voice channel successfully");
		} else {
			logger.debug("Already connected to a voice channel");
		}
	} catch (error) {
		logger.debug(`Failed to connect to voice channel:  ${JSON.stringify(error)}`);
		return await interaction
			.editReply({
				content: lang?.music?.NoPermission ?? "Bot không có quyền tham gia hoặc nói trong kênh thoại này",
				ephemeral: true,
			})
			.catch(() => {
				logger.debug("Failed to edit reply after connection error");
			});
	}

	logger.debug("Acquiring task entry from task queue");
	const entry = queues.tasksQueue.acquire();
	logger.debug("Task entry acquired, waiting for task resolution");
	await entry.getTask();
	logger.debug("Task resolved, emitting PlayerStart event");

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
			}),
		);
		logger.debug("PlayerStart event emitted successfully");
		// if (!queues.isPlaying()) await queues.node.play();
	} finally {
		logger.debug("Releasing task entry");
		queues.tasksQueue.release();
	}
	logger.debug("Exiting joinVoiceChannel function");
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
	logger.debug("Starting cleanUpInteraction");
	if (queue?.metadata) {
		logger.debug("Queue metadata exists");
		if (interaction?.customId === "S_player_Search") {
			await interaction.message.delete().catch(() => {
				logger.debug("Failed to delete interaction message");
			});
		}
		await interaction.deleteReply().catch(() => {
			logger.debug("Failed to delete interaction reply");
		});
	} else {
		logger.debug("No queue metadata");
		if (interaction?.customId === "S_player_Search") {
			await interaction.deleteReply().catch(() => {
				logger.debug("Failed to delete interaction reply");
			});
		}
	}
	logger.debug("Exiting cleanUpInteraction");
	return;
}

async function handleError(interaction, lang) {
	logger.debug("Starting handleError");
	const response = { content: lang?.music?.NOres ?? "❌ | Không tìm thấy bài hát", ephemeral: true };
	if (interaction.replied || interaction.deferred) {
		logger.debug("Interaction already replied or deferred");
		try {
			await interaction.editReply(response);
			logger.debug("Edited interaction reply successfully");
		} catch {
			logger.warn("Failed to edit interaction reply, fetching reply");
			const meess = await interaction.fetchReply();
			await meess.edit(response).catch(() => {
				logger.error("Failed to edit fetched reply");
			});
		}
	} else {
		logger.debug("Replying to interaction");
		await interaction.reply(response).catch(() => {
			logger.error("Failed to reply to interaction");
		});
	}
	logger.debug("Exiting handleError");
	return;
}

//#endregion Play Request
//#region Search Track
async function handleSearchRequest(interaction, query, lang) {
	const results = await player.search(query, { searchEngine: config.PlayerConfig.QueryType });
	logger.debug(`Search results:  ${results?.tracks?.length}`);
	const tracks = filterTracks(results?.tracks);
	logger.debug(`Filtered tracks:  ${tracks?.length}`);

	if (!tracks?.length) {
		logger.debug("No tracks found");
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

	logger.debug("Sending search results");
	return sendSearchResults(interaction, query, tracks, lang);
}

function filterTracks(tracks) {
	const uniqueTracks = [];
	const seenUrls = new Set();
	for (const track of tracks) {
		if (track?.url?.length < 100 && !seenUrls.has(track?.url)) {
			uniqueTracks.push(track);
			seenUrls.add(track?.url);
			if (uniqueTracks.length >= 20) break;
		}
	}
	return uniqueTracks;
}

async function sendSearchResults(interaction, query, tracks, lang) {
	logger.debug("Preparing to send search results");
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
		logger.debug("Image search is enabled");
		const searchPlayer = tracks.map((track, i) => ({
			index: i + 1,
			avatar: track?.thumbnail,
			displayName: track.title.slice(0, tracks.length > 1 ? 30 : 80),
			time: track.duration,
		}));

		try {
			const attachment = await buildImageInWorker(searchPlayer, query);
			logger.debug("Image built successfully");
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
				name: `${i + 1}: ${track.author} - ${track.title.slice(0, 50 - track.author.length)} \`[${track.duration}]\``.slice(
					0,
					99,
				),
				value: ` `,
				inline: false,
			})),
		);
	logger.debug("Search results sent");
	return interaction.editReply({ embeds: [embed], components: [row] }).catch(() => {
		logger.debug("Failed to edit reply with search results");
	});
}
//#endregion Search Track
