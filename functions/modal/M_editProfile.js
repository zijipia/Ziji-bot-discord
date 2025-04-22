const { EmbedBuilder } = require("discord.js");
const { useDB, useConfig } = require("@zibot/zihooks");
const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/i;

module.exports.data = {
	name: "M_editProfile",
	type: "modal",
};

/**
 * @param { object } modal - object modal
 * @param { import ("discord.js").ModalSubmitInteraction } modal.interaction - modal interaction
 * @param { import('../../lang/vi.js') } modal.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferReply().catch(() => {});
	let hexColor = interaction.fields.getTextInputValue("Probcolor");

	const success = await useDB().ZiUser.updateOne(
		{ userID: interaction.user.id },
		{
			$set: {
				color: HEX_COLOR_REGEX.test(hexColor) ? hexColor : "",
			},
		},
		{ upsert: true },
	);
	const mess = success ? lang.RankSystem.editOK : lang.RankSystem.editNG;
	return interaction.editReply({
		embeds: [
			new EmbedBuilder()
				.setDescription(mess)
				.setColor(success ? "Green" : "Red")
				.setImage(useConfig().botConfig.Banner)
				.setTimestamp(),
		],
	});
};
