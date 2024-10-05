/** @format */

const { MessageContextMenuCommandInteraction } = require("discord.js");

module.exports.data = {
	name: "Play / Add music",
	type: 3, // context
	options: [],
	integration_types: [0],
	contexts: [0],
};

/**
 * @param { object } context - object command
 * @param { MessageContextMenuCommandInteraction } context.interaction - interaction
 * @param { import('../../lang/vi.js') } context.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	let query = interaction.targetMessage.content;
	if (!query) {
		const embed = interaction.targetMessage.embeds?.at(0).data;
		if (embed) {
			query = embed?.author?.url ?? embed?.description;
		}
	}
	const command = interaction.client.functions.get("Search");
	await command.execute(interaction, query, lang);
};
