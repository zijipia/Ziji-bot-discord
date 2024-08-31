const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

module.exports = async (client) => {
  const globalCommands = [];
  const serverSpecificCommands = [];

  // Grab all the command folders from the commands directory
  const foldersPath = path.join(__dirname, 'commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ('data' in command && 'execute' in command) {
        if (command.data.global) {
          globalCommands.push(command.data);
        } else {
          serverSpecificCommands.push(command.data);
        }
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(process.env.TOKEN);

  try {
    console.log(
      `Started refreshing ${globalCommands.length} global application [/] commands.`,
    );
    // Deploy global commands
    const globalData = await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: globalCommands },
    );
    console.log(
      `Successfully reloaded ${globalData.length} global application [/] commands.`,
    );

    // Initialize serverData as an empty object
    const serverData = {};

    // Deploy server-specific commands
    const guildIds = config?.DevGuild;

    // Nếu không có guilds, thoát
    if (guildIds) {
      for (const guildId of guildIds) {
        console.log(
          `Started refreshing ${serverSpecificCommands.length} guild-specific application [/] commands for guild ${guildId}.`,
        );
        serverData[guildId] = await rest.put(
          Routes.applicationGuildCommands(client.user.id, guildId),
          { body: serverSpecificCommands },
        );
        console.log(
          `Successfully reloaded ${serverData[guildId].length} guild-specific application [/] commands for guild ${guildId}.`,
        );
      }
    } else {
      console.log(
        '[WARNING] No guilds were provided in the config file. Skipping server-specific command deployment.',
      );
    }

    return { global: globalData, serverSpecific: serverData };
  } catch (error) {
    console.error(error);
  }
};
