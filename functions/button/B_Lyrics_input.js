const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports.data = {
	name: "B_Lyrics_input",
	type: "button",
};

/**
 * @param { object } button - object button
 * @param { import ("discord.js").ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
	const modal = new ModalBuilder()
		.setTitle("Search Synced Lyrics")
		.setCustomId("M_Lyrics_input")
		.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder().setCustomId("search-input").setLabel("Name Song").setStyle(TextInputStyle.Short),
			),
		);
	await interaction.showModal(modal);
	return;
};
