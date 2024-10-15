const { useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "S_player_Track",
	type: "SelectMenu",
};

/**
 * @param { object } selectmenu - object selectmenu
 * @param { import ("discord.js").StringSelectMenuInteraction } selectmenu.interaction - selectmenu interaction
 * @param { import('../../lang/vi.js') } selectmenu.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	// track Selec from text search command | search modal | search context | etc...
	const query = interaction.values?.at(0);
	if (query === "cancel") return interaction.message.delete().catch((e) => {});
	const command = useFunctions().get("Search");
	await command.execute(interaction, query, lang);
	return;
};
