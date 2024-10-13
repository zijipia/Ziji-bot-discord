const { useQueue } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");
const Functions = useFunctions();

module.exports.data = {
	name: "S_player_Fillter",
	type: "SelectMenu",
};

/**
 * @param { object } selectmenu - object selectmenu
 * @param { import ("discord.js").StringSelectMenuInteraction } selectmenu.interaction - selectmenu interaction
 * @param { import('../../lang/vi.js') } selectmenu.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	const { client, user, values } = interaction;
	const queue = useQueue(interaction.guild.id);
	if (queue.metadata.requestedBy?.id !== user.id) {
		return interaction.reply({ content: "You cannot interact with this menu.", ephemeral: true });
	}
	const fillter = values?.at(0);
	const Fillter = Functions.get("Fillter");
	const player = Functions.get("player_func");
	await interaction?.deferUpdate().catch((e) => {});
	await Fillter.execute(interaction, fillter);
	queue.metadata.mess.edit(await player.execute({ queue }));
	return;
};
