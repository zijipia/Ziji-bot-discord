module.exports.data = {
	name: "dog",
	description: "Random ảnh chó",
	type: 1, // slash command
	options: [
		{
			name: "count",
			description: "Số lượng chó",
			type: 4, // INTEGER
			required: false,
			min_value: 1,
			max_value: 10,
		},
	],
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferReply();
	const count = interaction.options.getInteger("count") || 1;

	const response = await fetch(`https://dog.ceo/api/breeds/image/random/${count}`);
	const data = await response.json();

	const urls = data.message;

	await interaction.editReply({ files: urls });
};
