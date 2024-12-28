const { useMainPlayer, useQueue, Track } = require("discord-player");
const player = useMainPlayer();
module.exports.data = {
	name: "tts",
	description: "Thay mặt bạn nói điều gì đó",
	type: 1, // slash command
	options: [
		{
			name: "context",
			description: "Điều bạn muốn nói",
			type: 3,
			required: true,
		},
	],
	integration_types: [0],
	contexts: [0],
};

/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	const { client, guild, user, options } = interaction;
	await interaction.deferReply({ fetchReply: true }).catch((e) => {});

	const context = options.getString("context");

	const voiceChannel = interaction.member?.voice.channel;
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

	const result = await client.run(`Answer up to 150 characters for this question: ${context}\nRequested by: ${user.username}`);

	const queryy = {
		lang: lang.local_names || "vi",
		slow: false,
		host: "https://translate.google.com",
	};

	const tracls = new Track(player, {
		title: context ?? "Unknown Title",
		description: result,
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

	await player.play(voiceChannel, tracls, {
		audioPlayerOptions: {
			queue: false,
		},
		nodeOptions: {
			selfDeaf: false,
			volume: 100,
			leaveOnEmpty: true,
			leaveOnEmptyCooldown: 50_000,
			leaveOnEnd: true,
			leaveOnEndCooldown: 500_000,
			pauseOnEmpty: true,
			metadata: {
				channel: interaction.channel,
				requestedBy: user,
				LockStatus: false,
				ZiLyrics: { Active: false },
				lang: lang || langdef,
				mess: interaction?.customId !== "S_player_Search" ? await interaction.fetchReply() : interaction.message,
			},
		},
	});
	return;
};
