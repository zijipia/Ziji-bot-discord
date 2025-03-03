const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports.data = {
	name: "B_FBreply",
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
		.setTitle("FeedBack Reply")
		.setCustomId("M_FBreply")
		.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder()
					.setCustomId("ids")
					.setLabel("ID messenger")
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
					.setValue(interaction.message.embeds?.at(0).footer.text || 0),
			),
			new ActionRowBuilder().addComponents(
				new TextInputBuilder().setCustomId("mess").setRequired(true).setLabel("Nội dung").setStyle(TextInputStyle.Paragraph),
			),
		);
	await interaction.showModal(modal);
	return;
};
