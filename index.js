const fs = require('fs').promises;
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { ZiExtractor, useZiVoiceExtractor } = require('ziextractor');
const chalk = require('chalk');
const { table } = require('table');
const config = require('./config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // for guild related things
    GatewayIntentBits.GuildVoiceStates, // for voice related things
    GatewayIntentBits.GuildMessageReactions, // for message reactions things
    GatewayIntentBits.GuildMembers, // for guild members related things
    // GatewayIntentBits.GuildEmojisAndStickers, // for manage emojis and stickers
    // GatewayIntentBits.GuildIntegrations, // for discord Integrations
    // GatewayIntentBits.GuildWebhooks, // for discord webhooks
    GatewayIntentBits.GuildInvites, // for guild invite managing
    // GatewayIntentBits.GuildPresences, // for user presence things
    GatewayIntentBits.GuildMessages, // for guild messages things
    // GatewayIntentBits.GuildMessageTyping, // for message typing things
    GatewayIntentBits.DirectMessages, // for dm messages
    GatewayIntentBits.DirectMessageReactions, // for dm message reaction
    // GatewayIntentBits.DirectMessageTyping, // for dm message typinh
    // GatewayIntentBits.MessageContent, // enable if you need message content things
  ],
  allowedMentions: {
    parse: ['users'],
    repliedUser: false,
  },
});
const player = new Player(client, {
  skipFFmpeg: false,
});

const { GiveawaysManager } = require('discord-giveaways');

client.giveaway = new GiveawaysManager(client, {
  storage: './discord-giveaways/giveaways.json',
  default: {
    botsCanWin: false,
    embedColor: 'Random',
    embedColorEnd: '#000000',
    reaction: '🎉',
  },
});

const ziVoice = useZiVoiceExtractor({
  ignoreBots: true,
  minimalVoiceMessageDuration: 1,
  lang: 'vi-VN',
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
// player.extractors.loadDefault();

// player.on('debug', console.log);

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
        const files = await fs.readdir(folderPath).then(files => files.filter(file => file.endsWith('.js')));

        await Promise.all(
          files.map(async file => {
            const filePath = path.join(folderPath, file);
            try {
              const module = require(path.resolve(filePath));
              if ('data' in module && 'execute' in module) {
                const isDisabled = config.disabledCommands.includes(module.data.name);
                clientCommands.push([chalk.hex(isDisabled ? '#4733FF' : '#E5C3FF')(module.data.name), isDisabled ? '❌' : '✅']);
                if (!isDisabled) collection.set(module.data.name, module);
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
      })
    );

    console.log(
      table(clientCommands, {
        header: {
          alignment: 'center',
          content: `Commands ${path.basename(directory)}`,
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
            const eventHandler = async (...args) => {
              try {
                await event.execute(...args);
              } catch (executeError) {
                console.error(`Error executing event ${event.name}:`, executeError);
              }
            };
            target[event.once ? 'once' : 'on'](event.name, eventHandler);
          } catch (loadError) {
            console.error(`Error loading event from file ${file.name}:`, loadError);
            clientEvents.push([chalk.hex('#FF5733')(file.name), '❌']);
          }
        }
      })
    );
  };

  await loadEventFiles(directory);

  console.log(
    table(clientEvents, {
      header: {
        alignment: 'center',
        content: `Events ${path.basename(directory)}`,
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
    loadEvents(path.join(__dirname, 'voiceExtractor'), ziVoice),
  ]);

  client.login(process.env.TOKEN).catch(error => {
    console.error('Error logging in:', error);
    console.error("The Bot Token You Entered Into Your Project Is Incorrect Or Your Bot's INTENTS Are OFF!");
  });
};

initialize().catch(error => {
  console.error('Error during initialization:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
  client?.errorLog(`Unhandled promise rejection: **${error.message}**`);
  client?.errorLog(error.stack);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
  client?.errorLog(`Uncaught exception: **${error.message}**`);
  client?.errorLog(error.stack);
});
