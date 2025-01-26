const { useMainPlayer, useQueue, Track } = require("discord-player");
const { useDB, useConfig } = require("@zibot/zihooks");
const langdef = require("./../../lang/vi");
const player = useMainPlayer();
const config = useConfig();

//====================================================================//

const DefaultPlayerConfig = {
	selfDeaf: false,
	volume: 100,
	leaveOnEmpty: true,
	leaveOnEmptyCooldown: 50_000,
	leaveOnEnd: true,
	leaveOnEndCooldown: 500_000,
	pauseOnEmpty: true,
};
//====================================================================//
/**
 * @param { import ("discord.js").BaseInteraction } interaction
 * @param { String } context
 * @param { langdef } lang
 */
module.exports.execute = async (interaction, context, lang, options = { "enable queue": false, assistant: true }) => {
	const { guild, user } = interaction;

	const queue = options?.queue ?? useQueue(guild.id);
	if (!!queue?.currentTrack) return;
	try {
		const voiceChannel = interaction.member?.voice?.channel ?? options?.voice;
		const playerConfig = { ...DefaultPlayerConfig, ...config?.PlayerConfig };

		playerConfig.selfDeaf = false;

		if (playerConfig.volume === "auto") {
			const DataBase = useDB();
			playerConfig.volume =
				DataBase ?
					((await DataBase.ZiUser.findOne({ userID: user.id }))?.volume ?? DefaultPlayerConfig.volume)
				:	DefaultPlayerConfig.volume;
		}

		// build Track::
		const queryy = {
			lang: lang.local_names || "vi",
			slow: false,
			host: "https://translate.google.com",
			context: context.replace(/[^a-zA-Z0-9À-ỹ\s]/g, ""),
			"full context": context,
			old_Prompt: options?.old_Prompt,
		};

		const tracls = new Track(player, {
			title: options?.title ?? context ?? "Unknown Title",
			description: context,
			author: user.name,
			url: "https://translate.google.com",
			requestedBy: user,
			thumbnail: user.displayAvatarURL({ size: 1024 }),
			views: "1",
			duration: "0",
			source: "tts",
			raw: queryy,
			queryType: "tts",
			metadata: queryy,
			async requestMetadata() {
				return queryy;
			},
		});
		//play
		await player.play(voiceChannel, tracls, {
			audioPlayerOptions: {
				queue: options["enable queue"],
			},
			nodeOptions: {
				...playerConfig,
				metadata: queue?.metadata ?? {
					listeners: [user],
					channel: interaction.channel,
					requestedBy: user,
					LockStatus: false,
					voiceAssistance: options.assistant && config?.DevConfig?.VoiceExtractor,
					ZiLyrics: { Active: false },
					lang: lang || langdef,
					focus: options?.focus,
					mess: interaction?.customId !== "S_player_Search" ? await interaction.fetchReply() : interaction.message,
				},
			},
			requestedBy: interaction.user,
		});
		return;
	} catch (e) {
		console.error(e);
		return;
	}
};

//====================================================================//
module.exports.data = {
	name: "TextToSpeech",
	type: "player",
};
