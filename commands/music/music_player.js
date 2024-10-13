const { useMainPlayer, useQueue } = require("discord-player");
const { CommandInteraction } = require("discord.js");
const player = useMainPlayer();
const { useFunctions } = require("@zibot/zihooks");
module.exports.data = {
	name: "player",
	description: "Gọi Player",
	type: 1, // slash commad
	options: [],
	integration_types: [0],
	contexts: [0],
};

/**
 * @param { object } command - object command
 * @param { CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } lang
 */

module.exports.execute = async ({ interaction, lang }) => {
	const { client, guild } = interaction;
	await interaction.deferReply({ fetchReply: true });
	const queue = useQueue(guild.id);
	if (!queue) return interaction.editReply({ content: lang.music.NoPlaying }).catch((e) => {});
	queue.metadata.mess.edit({ components: [] }).catch((e) => {});

	queue.metadata.mess = await interaction.fetchReply();

	const player = useFunctions().get("player_func");
	if (!player) return;
	const res = await player.execute(client, queue);
	await interaction.editReply(res);
};
