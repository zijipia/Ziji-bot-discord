const { REST, Routes } = require("discord.js");
const fs = require("node:fs").promises;
const path = require("node:path");
const config = require("./config");

module.exports = async (client) => {
	const commands = { global: [], owner: [] };

	// Load commands from all folders
	const foldersPath = path.join(__dirname, "commands");
	const loadCommands = async (dir) => {
		const files = await fs.readdir(dir, { withFileTypes: true });
		await Promise.all(
			files.map(async (file) => {
				const filePath = path.join(dir, file.name);
				if (file.isDirectory()) {
					await loadCommands(filePath);
				} else if (file.isFile() && file.name.endsWith(".js")) {
					const command = require(filePath);
					if (!("data" in command) || !("execute" in command)) return;
					if (command?.data?.enable == false) return;
					if (config?.disabledCommands?.includes(command.data.name)) return;
					commands[command.data.owner ? "owner" : "global"].push(command.data);
				}
			}),
		);
	};
	await loadCommands(foldersPath);

	const rest = new REST().setToken(process.env.TOKEN);

	const deployCommands = async (commandType, route) => {
		if (commands[commandType].length > 0) {
			await rest.put(route, { body: commands[commandType] });
			client?.errorLog(`Successfully reloaded ${commands[commandType].length} ${commandType} application [/] commands.`);
			console.log(`Successfully reloaded ${commands[commandType].length} ${commandType} application [/] commands.`);
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
