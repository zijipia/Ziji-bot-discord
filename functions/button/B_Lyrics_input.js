/** @format */

const { useMainPlayer, useQueue } = require("discord-player");
const { ModalBuilder, TextInputBuilder, TextInputStyle, ButtonInteraction, ActionRowBuilder } = require("discord.js");
const player = useMainPlayer();
module.exports.data = {
	name: "B_Lyrics_input",
	type: "button",
};

/**
 * @param { object } button - object button
 * @param { ButtonInteraction } button.interaction - button interaction
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
