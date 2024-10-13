const { useQueue } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "B_player_refresh",
	type: "button",
};

/**
 * @param { object } button - object button
 * @param { import ("discord.js").ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferUpdate();
	const queue = useQueue(interaction.guild.id);
	if (!queue) return;
	const player = useFunctions().get("player_func");

	if (!player) return;
	const res = await player.execute({ queue });
	queue.metadata.mess.edit(res);
};
