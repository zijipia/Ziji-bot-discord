const { useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "M_player_search",
	type: "modal",
};

/**
 * @param { object } modal - object modal
 * @param { import ("discord.js").ModalSubmitInteraction } modal.interaction - modal interaction
 * @param { import('../../lang/vi.js') } modal.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	const { guild, client, fields } = interaction;
	const query = fields.getTextInputValue("search-input");
	const command = useFunctions().get("Search");
	await command.execute(interaction, query, lang);
};
