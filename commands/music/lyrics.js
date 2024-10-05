/** @format */

const { useMainPlayer, useQueue } = require("discord-player");
const { CommandInteraction, EmbedBuilder } = require("discord.js");
const player = useMainPlayer();

module.exports.data = {
	name: "lyrics",
	description: "Lời bài hát",
	type: 1, // slash commad
	options: [
		{
			name: "query",
			description: "Tên bài hát",
			type: 3,
		},
	],
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

/**
 * @param { object } command - object command
 * @param { CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } lang
 */

module.exports.execute = async ({ interaction, lang }) => {
	const { client, guild, options } = interaction;
	await interaction.deferReply();
	const query = await options.getString("query");

	const Lyrics = client.functions.get("Lyrics");
	if (!Lyrics) return;

	await Lyrics.execute(interaction, { type: "plainLyrics", query });
	return;
};
