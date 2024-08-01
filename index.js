const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require("dotenv").config();
const { Player } = require("discord-player");
const { ZiExtractor } = require("ziextractor");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const player = new Player(client, {
    skipFFmpeg: false
});
player.setMaxListeners(100);
player.extractors.register(ZiExtractor, {});
player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');

player.on("debug", console.log)
client.commands = new Collection();
client.functions = new Collection();
client.cooldowns = new Collection();

const loadFiles = (directory, collection) => {
    const folders = fs.readdirSync(directory);
    console.log(`========== Load ${directory.split("\\").slice(-1)?.at(0)} ==========`);
    for (const folder of folders) {
        const folderPath = path.join(directory, folder);
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const module = require(filePath);

            if ('data' in module && 'execute' in module) {
                console.log(`Loaded ${folder}:`, module.data.name);
                collection.set(module.data.name, module);
            } else {
                console.log(`[WARNING] The ${folder} at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
};
loadFiles(path.join(__dirname, 'commands'), client.commands);
loadFiles(path.join(__dirname, 'functions'), client.functions);

const loadEvents = (directory, target) => {
    const files = fs.readdirSync(directory).filter(file => file.endsWith('.js'));
    console.log(`========== Load ${directory.split("\\").slice(-1)?.at(0)} ==========`);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const event = require(filePath);
        console.log(`Loaded ${event?.type}:`, event.name);
        target.on(event.name, (...args) => event.execute(...args));
    }
};

loadEvents(path.join(__dirname, 'events'), client);
loadEvents(path.join(__dirname, 'player'), player.events);

client.login(process.env.TOKEN);
