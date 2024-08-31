const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { ZiExtractor } = require('ziextractor');
const chalk = require('chalk');
const { table } = require('table');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const player = new Player(client, {
  skipFFmpeg: false,
});
player.setMaxListeners(100);
player.extractors.register(YoutubeiExtractor, {
  authentication: process.env?.YoutubeAUH || '',
  streamOptions: {
    useClient: 'ANDROID',
  },
});
player.extractors.register(ZiExtractor, {});
player.extractors.loadDefault(ext => !['YouTubeExtractor'].includes(ext));

// player.on("debug", console.log)

client.commands = new Collection();
client.functions = new Collection();
client.cooldowns = new Collection();

const loadFiles = (directory, collection) => {
  try {
    const folders = fs.readdirSync(directory);
    console.log(`========== Load ${directory.split('\\').slice(-1)?.at(0)} ==========`);
    const clientCommands = [];
    for (const folder of folders) {
      const folderPath = path.join(directory, folder);
      const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        try {
          // Use path.resolve to ensure the path is absolute
          const module = require(path.resolve(filePath));

          if ('data' in module && 'execute' in module) {
            clientCommands.push([chalk.hex('#E5C3FF')(module.data.name), '✅']);
            collection.set(module.data.name, module);
          } else {
            clientCommands.push([chalk.hex('#FF5733')(file), '❌']);
            console.warn(`Module from ${file} is missing 'data' or 'execute' property.`);
          }
        } catch (moduleError) {
          console.error(`Error loading command from file ${file}:`, moduleError);
          clientCommands.push([chalk.hex('#FF5733')(file), '❌']);
        }
      }
    }
    console.log(
      table(clientCommands, {
        header: {
          alignment: 'center',
          content: 'Client Commands',
        },
        singleLine: true,
        columns: [{ width: 25 }, { width: 5, alignment: 'center' }],
      })
    );
  } catch (dirError) {
    console.error(`Error reading directory ${directory}:`, dirError);
  }
};

const loadEvents = (directory, target) => {
  const clientEvents = [];

  // Helper function to recursively find all .js files in a directory
  const loadEventFiles = dir => {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        // Recursively load from subdirectories
        loadEventFiles(filePath);
      } else if (file.isFile() && file.name.endsWith('.js')) {
        try {
          // Use path.resolve to ensure absolute path
          const event = require(path.resolve(filePath));
          clientEvents.push([chalk.hex('#E5C3FF')(file.name), '✅']);

          // Wrap event execution in a try-catch block to handle errors during execution
          target.on(event.name, (...args) => {
            try {
              event.execute(...args);
            } catch (executeError) {
              console.error(`Error executing event ${event.name}:`, executeError);
            }
          });
        } catch (loadError) {
          console.error(`Error loading event from file ${file.name}:`, loadError);
          clientEvents.push([chalk.hex('#FF5733')(file.name), '❌']);
        }
      }
    }
  };

  console.log(`========== Load ${directory.split('\\').slice(-1)?.at(0)} ==========`);

  loadEventFiles(directory);

  console.log(
    table(clientEvents, {
      header: {
        alignment: 'center',
        content: 'Client Events',
      },
      singleLine: true,
      columns: [{ width: 25 }, { width: 5, alignment: 'center' }],
    })
  );
};

loadFiles(path.join(__dirname, 'commands'), client.commands);
loadFiles(path.join(__dirname, 'functions'), client.functions);
loadEvents(path.join(__dirname, 'events'), client);
loadEvents(path.join(__dirname, 'discord-player'), player.events);

client.login(process.env.TOKEN);

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});
