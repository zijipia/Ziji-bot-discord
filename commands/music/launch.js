/**
 * See {@link https://discord.com/developers/docs/activities/development-guides#creating-an-entry-point-command creating-an-entry-point-command}
 */
module.exports.data = {
	name: "launch",
	description: "Launch app",
	type: 4, // PRIMARY_ENTRY_POINT
	handler: 2, //DISCORD_LAUNCH_ACTIVITY
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
