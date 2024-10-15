require("dotenv").config();
const path = require("node:path");
const config = require("./config");
const { Player } = require("discord-player");
const { GiveawaysManager } = require("discord-giveaways");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { loadFiles, loadEvents } = require("./startup/loader.js");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { ZiExtractor, useZiVoiceExtractor } = require("@zibot/ziextractor");
const { useClient, useCooldowns, useCommands, useFunctions, useGiveaways } = require("@zibot/zihooks");

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
		parse: ["users"],
		repliedUser: false,
	},
});
const player = new Player(client, {
	skipFFmpeg: false,
});

player.setMaxListeners(100);
if (config.DevConfig.YoutubeiExtractor)
	player.extractors.register(YoutubeiExtractor, {
		authentication: process.env?.YoutubeAUH || "",
		streamOptions: {
			useClient: "IOS",
		},
	});

if (config.DevConfig.ZiExtractor) player.extractors.register(ZiExtractor, {});
player.extractors.loadDefault((ext) => !["YouTubeExtractor"].includes(ext));

// Debug
if (config.DevConfig.DJS_DEBUG) client.on("debug", console.log);
if (config.DevConfig.DPe_DEBUG) player.events.on("debug", console.log);
if (config.DevConfig.DP_DEBUG) {
	console.log(player.scanDeps());
	player.on("debug", console.log);
}

useGiveaways(
	config.DevConfig.Giveaway ?
		new GiveawaysManager(client, {
			storage: "./discord-giveaways/giveaways.json",
			default: {
				botsCanWin: false,
				embedColor: "Random",
				embedColorEnd: "#000000",
				reaction: "🎉",
			},
		})
	:	() => false,
);

const ziVoice = useZiVoiceExtractor({
	ignoreBots: true,
	minimalVoiceMessageDuration: 1,
	lang: "vi-VN",
});

const initialize = async () => {
	useClient(client);
	useCooldowns(new Collection());

	await Promise.all([
		loadFiles(path.join(__dirname, "commands"), useCommands(new Collection())),
		loadFiles(path.join(__dirname, "functions"), useFunctions(new Collection())),
		loadEvents(path.join(__dirname, "events/client"), client),
		loadEvents(path.join(__dirname, "events/player"), player.events),
		loadEvents(path.join(__dirname, "events/voice"), ziVoice),
		loadEvents(path.join(__dirname, "events/process"), process),
	]);

	client.login(process.env.TOKEN).catch((error) => {
		console.error("Error logging in:", error);
		console.error("The Bot Token You Entered Into Your Project Is Incorrect Or Your Bot's INTENTS Are OFF!");
	});
};

initialize().catch((error) => {
	console.error("Error during initialization:", error);
});
