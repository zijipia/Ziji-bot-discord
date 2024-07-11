const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require("dotenv").config();
const { Player } = require("discord-player")
// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});
const player = new Player(client, {
    skipFFmpeg: false
})
player.setMaxListeners(100);
player.extractors.loadDefault();

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
// client.once(Events.ClientReady, async readyClient => {
//     // const cammandsdata = await require("./deploy")(readyClient);
//     // console.log(cammandsdata)
//     console.log(`Ready! Logged in as ${readyClient.user.tag}`);
// });
client.commands = new Collection();
client.functions = new Collection()

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const commandsfilePath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(commandsfilePath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsfilePath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            console.log("Loaded command:", command.data.name)
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
const functionsPath = path.join(__dirname, 'functions');
const functionsFolders = fs.readdirSync(functionsPath);

for (const folder of functionsFolders) {
    const functionsfilePath = path.join(functionsPath, folder);
    const functionsFiles = fs.readdirSync(functionsfilePath).filter(file => file.endsWith('.js'));
    for (const file of functionsFiles) {
        const filePath = path.join(functionsfilePath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the functions name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            console.log("Loaded functions:", command.data.name)
            client.functions.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The functions at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    client.on(event.name, (...args) => event.execute(...args));
}
const playerPath = path.join(__dirname, 'player');
const playerFiles = fs.readdirSync(playerPath).filter(file => file.endsWith('.js'));

for (const file of playerFiles) {
    const filePath = path.join(playerPath, file);
    const event = require(filePath);
    player.events.on(event.name, (...args) => event.execute(client, ...args));
}
// (async () => {

// })()

// Log in to Discord with your client's token
client.login(process.env.TOKEN);