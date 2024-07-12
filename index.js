const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require("dotenv").config();
const { Player } = require("discord-player");

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
player.extractors.loadDefault();

client.commands = new Collection();
client.functions = new Collection();

const loadFiles = (directory, collection) => {
    const folders = fs.readdirSync(directory);
    console.log(`======= Load ${folders} =======`);
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
    console.log(`======= Load events =======`);
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
