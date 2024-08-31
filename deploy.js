const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

module.exports = async client => {
  const globalCommands = [];
  const ownerCommands = [];

  // Load commands from all folders
  const foldersPath = path.join(__dirname, 'commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ('data' in command && 'execute' in command) {
        if (command.data.owner) {
          ownerCommands.push(command.data);
        } else {
          globalCommands.push(command.data);
        }
      }
    }
  }

  const rest = new REST().setToken(process.env.TOKEN);

  try {
    console.log(`Started refreshing ${globalCommands.length} global application [/] commands.`);
    // Deploy global commands
    if (globalCommands.length > 0) {
      console.log(`Successfully reloaded ${globalCommands.length} global application [/] commands.`);
      await rest.put(Routes.applicationCommands(client.user.id), { body: globalCommands });
    }

    // Deploy owner commands to specific guilds
    const guildIds = config.DevGuild || [];

    if (guildIds.length > 0 && ownerCommands.length > 0) {
      console.log(`Started refreshing ${ownerCommands.length} owner application [/] commands for guild ${guildIds}.`);

      for (const guildId of guildIds) {
        try {
          await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: ownerCommands });
          console.log(
            `Successfully reloaded ${ownerCommands.length} owner application [/] commands for guild ${guildIds}.`
          );
        } catch (error) {
          console.error(
            `Error deploying owner commands to guild ${guildId}. Make sure you provided the correct guild ID and the bot is in the guild.`
          );
          process.exit(1);
        }
      }
    } else {
      console.log('No owner commands to deploy or no guilds provided.');
    }
  } catch (error) {
    console.error('Error during command deployment:', error);
  }
};
