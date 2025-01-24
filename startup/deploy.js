const { REST, Routes } = require("discord.js");
const { useCommands, useConfig, useLogger } = require("@zibot/zihooks");
const config = useConfig();

module.exports = async (client) => {
	const commands = { global: [], owner: [] };

	// Load commands
	await Promise.all(
		useCommands().map(async (command) => {
			/**
			 * useCommands đã xử lý các commands disable ở index.js file rồi.
			 *  -> Nên không cần thiết xử lý lại ở đây
			 */
			commands[command.data.owner ? "owner" : "global"].push(command.data);
		}),
	).catch((e) => useLogger().info(`Error reloaded commands:\n ${e}`));

	const rest = new REST().setToken(process.env.TOKEN);

	const deployCommands = async (commandType, route) => {
		if (commands[commandType].length > 0) {
			await rest.put(route, { body: commands[commandType] });
			client?.errorLog(`Successfully reloaded ${commands[commandType].length} ${commandType} application [/] commands.`);
			useLogger().info(`Successfully reloaded ${commands[commandType].length} ${commandType} application [/] commands.`);
		}
	};

	try {
		// Deploy global commands
		await deployCommands("global", Routes.applicationCommands(client.user.id));

		// Deploy owner commands to specific guilds
		const guildIds = config.DevGuild || [];
		if (guildIds.length > 0 && commands.owner.length > 0) {
			await Promise.all(
				guildIds.map((guildId) => deployCommands("owner", Routes.applicationGuildCommands(client.user.id, guildId))),
			);
		}
	} catch (error) {
		console.error("Error during command deployment:", error);
	}
};
