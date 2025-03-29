const { useMainPlayer, useQueue, Track } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");
const Functions = useFunctions();

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
	//channel:
	const voiceChannel = interaction.member.voice.channel;
	if (!voiceChannel) {
		return interaction.editReply({
			content: lang?.music?.NOvoiceChannel ?? "Bạn chưa tham gia vào kênh thoại",
			ephemeral: true,
		});
	}

	const voiceMe = guild.members.cache.get(client.user.id).voice.channel;
	if (voiceMe && voiceMe.id !== voiceChannel.id) {
		return interaction.editReply({
			content: lang?.music?.NOvoiceMe ?? "Bot đã tham gia một kênh thoại khác",
			ephemeral: true,
		});
	}

	const permissions = voiceChannel.permissionsFor(client.user);
	if (!permissions.has("Connect") || !permissions.has("Speak")) {
		return interaction.editReply({
			content: lang?.music?.NoPermission ?? "Bot không có quyền tham gia hoặc nói trong kênh thoại này",
			ephemeral: true,
		});
	}

	await interaction.deferReply({ fetchReply: true }).catch((e) => {});
	const queue = useQueue(guild.id);
	if (!queue?.metadata) await interaction.editReply({ content: "<a:loading:1151184304676819085> Loading..." });
	const context = options.getString("context");
	const tts = await Functions.get("TextToSpeech");
	await tts.execute(interaction, context, lang, { queue });

	return;
};
