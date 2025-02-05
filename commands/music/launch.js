const { useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "launch",
	description: "Launch app",
	type: 4,
	handler: 2,
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } lang
 */

module.exports.execute = async ({ interaction, lang }) => {
	return;
};
