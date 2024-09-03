const { CommandInteraction, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config');
const { REST, Routes } = require('discord.js');

module.exports.data = {
  name: 'reload',
  description: 'Reload all functions, commands, events, and discord-player',
  type: 1,
  options: [
    {
      name: 'deploy',
      description: 'Deploy new commands after reloading',
      type: 5, // BOOLEAN
      required: false,
    },
  ],
  integration_types: [0],
  contexts: [0],
  owner: true,
};

/**
 * @param {CommandInteraction} interaction
 */
module.exports.execute = async interaction => {
  if (!config.OwnerID.includes(interaction.user.id)) return;

  await interaction.deferReply();

  const client = interaction.client;
  const shouldDeploy = interaction.options.getBoolean('deploy') ?? false;
  const reloadResults = await reloadAll(client);

  if (shouldDeploy) {
    const deployResults = await deployCommands(client);
    reloadResults.deployed = deployResults;
  }

  const embed = new EmbedBuilder()
    .setTitle('Reload Results')
    .setColor('Green')
    .addFields(
      Object.entries(reloadResults).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: formatReloadResult(value),
        inline: true,
      }))
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
};

async function reloadAll(client) {
  const reloadFunctions = {
    functions: ['../../functions', client.functions],
    commands: ['../../commands', client.commands],
    events: ['../../events', null, reloadEvent],
    discordPlayer: ['../../discord-player', null, reloadDiscordPlayerEvent],
  };

  const results = {};
  for (const [key, [dirPath, collection, additionalAction]] of Object.entries(reloadFunctions)) {
    if (key === 'events') client.removeAllListeners();
    if (key === 'discordPlayer' && client.player && client.player.events) {
      client.player.events.removeAllListeners();
    }
    results[key] = await reloadModules(client, path.join(__dirname, dirPath), collection, key, additionalAction);
  }

  return results;
}

function reloadEvent(client, event) {
  const method = event.once ? 'once' : 'on';
  client[method](event.name, (...args) => event.execute(...args));
}

function reloadDiscordPlayerEvent(client, event) {
  if (client.player && client.player.events) {
    const method = event.once ? 'once' : 'on';
    client.player.events[method](event.name, (...args) => event.execute(...args));
  }
}

async function reloadModules(client, dirPath, collection, type, additionalAction = null) {
  const results = { success: 0, failed: 0 };
  const files = await getAllFiles(dirPath);

  for (const file of files) {
    if (file.endsWith('.js')) {
      try {
        delete require.cache[require.resolve(file)];
        const module = require(file);
        if (collection) {
          collection.set(module.data.name, module);
        }
        if (additionalAction) {
          additionalAction(client, module);
        }
        results.success++;
      } catch (error) {
        console.error(`Failed to reload ${type} ${file}:`, error);
        results.failed++;
      }
    }
  }

  return results;
}

async function getAllFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(entry => {
      const fullPath = path.join(dirPath, entry.name);
      return entry.isDirectory() ? getAllFiles(fullPath) : fullPath;
    })
  );
  return files.flat();
}

function formatReloadResult(result) {
  if (typeof result === 'object' && 'success' in result && 'failed' in result) {
    return `Success: ${result.success}\nFailed: ${result.failed}`;
  }
  return `${result}`;
}

async function deployCommands(client) {
  const commands = [];
  const ownerCommands = [];
  const commandFiles = await getAllFiles(path.join(__dirname, '../../commands'));

  for (const file of commandFiles) {
    if (file.endsWith('.js')) {
      const command = require(file);
      if ('data' in command && 'execute' in command) {
        if (command.data.owner) {
          ownerCommands.push(command.data);
        } else {
          commands.push(command.data);
        }
      }
    }
  }

  const rest = new REST().setToken(process.env.TOKEN);

  try {
    const globalData = await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log(`Successfully reloaded ${globalData.length} global application (/) commands.`);
    if (config.DevGuild && config.DevGuild.length > 0) {
      const ownerData = await rest.put(Routes.applicationGuildCommands(client.user.id, config.DevGuild[0]), {
        body: ownerCommands,
      });
      console.log(`Successfully reloaded ${ownerData.length} owner application (/) commands.`);
    }
    return {
      success: globalData.length + (config.DevGuild && config.DevGuild.length > 0 ? ownerCommands.length : 0),
      failed:
        commands.length +
        ownerCommands.length -
        (globalData.length + (config.DevGuild && config.DevGuild.length > 0 ? ownerCommands.length : 0)),
    };
  } catch (error) {
    console.error(error);
    return { success: 0, failed: commands.length + ownerCommands.length };
  }
}
