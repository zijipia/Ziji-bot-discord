const { useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "M_Lyrics_input",
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
	await interaction.deferUpdate();
	const Lyrics = useFunctions().get("Lyrics");
	if (!Lyrics) return;
	await Lyrics.execute(interaction, { type: "syncedLyrics", query });
	return;
};
