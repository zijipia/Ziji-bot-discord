const { useMainPlayer, useQueue } = require("discord-player");
const { ButtonInteraction } = require("discord.js");
module.exports.data = {
	name: "B_player_refresh",
	type: "button",
};

/**
 * @param { object } button - object button
 * @param { ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferUpdate();
	const queue = useQueue(interaction.guild.id);
	if (!queue) return;
	const player = interaction.client.functions.get("player_func");

	if (!player) return;
	const res = await player.execute(interaction.client, queue);
	queue.metadata.mess.edit(res);
};
