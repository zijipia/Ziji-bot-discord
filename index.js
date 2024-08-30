const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();
client.functions = new Collection();
client.cooldowns = new Collection();

const loadFilesAsync = async (directory, collection) => {
    const folders = fs.readdirSync(directory);
    console.log(`========== Load ${path.basename(directory)} ==========`);
    
    await Promise.all(folders.map(async (folder) => {
        const folderPath = path.join(directory, folder);
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        await Promise.all(files.map(async (file) => {
            const filePath = path.join(folderPath, file);
            const module = require(filePath);

            if ('data' in module && 'execute' in module) {
                console.log(`Loaded ${folder}:`, module.data.name);
                collection.set(module.data.name, module);
            } else {
                console.log(`[WARNING] The ${folder} at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }));
    }));
};

loadFilesAsync(path.join(__dirname, 'commands'), client.commands);
loadFilesAsync(path.join(__dirname, 'functions'), client.functions);

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

client.login(process.env.TOKEN);
