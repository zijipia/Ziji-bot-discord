const fs = require('fs').promises;
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
// player.extractors.register(YoutubeiExtractor, {
//   authentication: process.env?.YoutubeAUH || '',
//   streamOptions: {
//     useClient: 'ANDROID',
//   },
// });
player.extractors.register(ZiExtractor, {});
player.extractors.loadDefault(ext => !['YouTubeExtractor'].includes(ext));

client.commands = new Collection();
client.functions = new Collection();
client.cooldowns = new Collection();

const loadFiles = async (directory, collection) => {
  try {
    const folders = await fs.readdir(directory);
    const clientCommands = [];

    await Promise.all(
      folders.map(async folder => {
        const folderPath = path.join(directory, folder);
        try {
          const files = (await fs.readdir(folderPath)).filter(file => file.endsWith('.js'));

          await Promise.all(
            files.map(async file => {
              const filePath = path.join(folderPath, file);
              try {
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
            })
          );
        } catch (folderError) {
          console.error(`Error reading folder ${folder}:`, folderError);
        }
      })
    );

    console.log(
      table(clientCommands, {
        header: {
          alignment: 'center',
          content: `Client ${path.basename(directory)}`,
        },
        singleLine: true,
        columns: [{ width: 25 }, { width: 5, alignment: 'center' }],
      })
    );
  } catch (dirError) {
    console.error(`Error reading directory ${directory}:`, dirError);
  }
};

const loadEvents = async (directory, target) => {
  const clientEvents = [];

  const loadEventFiles = async dir => {
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });

      await Promise.all(
        files.map(async file => {
          const filePath = path.join(dir, file.name);

          if (file.isDirectory()) {
            await loadEventFiles(filePath);
          } else if (file.isFile() && file.name.endsWith('.js')) {
            try {
              const event = require(path.resolve(filePath));
              clientEvents.push([chalk.hex('#E5C3FF')(file.name), '✅']);

              target.on(event.name, async (...args) => {
                try {
                  await event.execute(...args);
                } catch (executeError) {
                  console.error(`Error executing event ${event.name}:`, executeError);
                }
              });
            } catch (loadError) {
              console.error(`Error loading event from file ${file.name}:`, loadError);
              clientEvents.push([chalk.hex('#FF5733')(file.name), '❌']);
            }
          }
        })
      );
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  };

  await loadEventFiles(directory);

  console.log(
    table(clientEvents, {
      header: {
        alignment: 'center',
        content: `Client ${path.basename(directory)}`,
      },
      singleLine: true,
      columns: [{ width: 25 }, { width: 5, alignment: 'center' }],
    })
  );
};

const initialize = async () => {
  await Promise.all([
    loadFiles(path.join(__dirname, 'commands'), client.commands),
    loadFiles(path.join(__dirname, 'functions'), client.functions),
    loadEvents(path.join(__dirname, 'events'), client),
    loadEvents(path.join(__dirname, 'discord-player'), player.events),
  ]);

  client.login(process.env.TOKEN);
};

initialize().catch(error => {
  console.error('Error during initialization:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});
