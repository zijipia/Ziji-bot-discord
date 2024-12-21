const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, BaseInteraction } = require("discord.js");
const { useMainPlayer, useQueue, decode, deserialize } = require("discord-player");
const { useDB, useConfig } = require("@zibot/zihooks");
const langdef = require("./../../lang/vi");
const player = useMainPlayer();
const config = useConfig();

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
module.exports.execute = async (interaction, decryptedData, lang, options = {}) => {
	const { client, guild, user } = interaction;

	const decodess = decode(decryptedData);
	console.log(decodess);
	const tracks = decodess.map((t) => deserialize(player, t));
	console.log("Restored tracks:", tracks);

	const playlist = player.createPlaylist({
		title: interaction.user.username + "Save Tracks",
		thumbnail: interaction.user.displayAvatarURL(),
		description: `${tracks?.length} Tracks`,
		type: "playlist",
		source: tracks?.at(0)?.source,
		id: interaction.user.id,
		url: config?.botConfig?.InviteBot,
		rawPlaylist: decodess,
		tracks: tracks,
	});
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
	try {
		if (!queue?.metadata) await interaction.editReply({ content: "<a:loading:1151184304676819085> Loading..." });

		const playerConfig = { ...DefaultPlayerConfig, ...config?.PlayerConfig };
		if (options.assistant && config?.DevConfig?.VoiceExtractor) {
			playerConfig.selfDeaf = false;
		}

		if (playerConfig.volume === "auto") {
			const DataBase = useDB();
			playerConfig.volume =
				DataBase ?
					((await DataBase.ZiUser.findOne({ userID: user.id }))?.volume ?? DefaultPlayerConfig.volume)
				:	DefaultPlayerConfig.volume;
		}

		await player.play(voiceChannel, playlist, {
			nodeOptions: {
				...playerConfig,
				metadata: queue?.metadata ?? {
					channel: interaction.channel,
					requestedBy: user,
					LockStatus: false,
					voiceAssistance: options.assistant && config?.DevConfig?.VoiceExtractor,
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
};

//====================================================================//
module.exports.data = {
	name: "Restored_tracks",
	type: "player",
};
