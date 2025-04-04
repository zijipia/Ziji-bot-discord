require("dotenv").config();
const { startServer } = require("./web");
const {
	useAI,
	useClient,
	useCooldowns,
	useCommands,
	useFunctions,
	useGiveaways,
	useConfig,
	useResponder,
	useWelcome,
	useLogger,
} = require("@zibot/zihooks");
const path = require("node:path");
const winston = require("winston");
const util = require("util");
const { Player } = require("discord-player");
const config = useConfig(require("./config"));
const { GiveawaysManager } = require("discord-giveaways");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { loadFiles, loadEvents, createfile } = require("./startup/loader.js");
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const { ZiExtractor, useZiVoiceExtractor, TextToSpeech } = require("@zibot/ziextractor");
const { DefaultExtractors } = require("@discord-player/extractor");
const readline = require("readline");

const client = new Client({
	rest: [{ timeout: 60_000 }],
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
		GatewayIntentBits.MessageContent, // enable if you need message content things
	],
	partials: [Partials.User, Partials.GuildMember, Partials.Message, Partials.Channel],
	allowedMentions: {
		parse: ["users"],
		repliedUser: false,
	},
});

createfile("./jsons");

// Configure logger
const logger = useLogger(
	winston.createLogger({
		level: config.DevConfig?.logger || "", // leave blank to enable all
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.printf(
				({ level, message, timestamp }) =>
					`[${timestamp}] [${level.toUpperCase()}]:` + util.inspect(message, { showHidden: false, depth: 2, colors: true }),
			),
		),
		transports: [
			new winston.transports.Console({
				format: winston.format.printf(
					({ level, message }) =>
						`[${level.toUpperCase()}]:` + util.inspect(message, { showHidden: false, depth: 2, colors: true }),
				),
			}),
			new winston.transports.File({ filename: "./jsons/bot.log", level: "error" }),
		],
	}),
);

const player = new Player(client, {
	skipFFmpeg: false,
});

player.setMaxListeners(100);
if (config.DevConfig.YoutubeiExtractor) {
	player.extractors.register(YoutubeiExtractor, {});
	require("youtubei.js").Log.setLevel(0);
}

if (config.DevConfig.ZiExtractor) player.extractors.register(ZiExtractor, {});

player.extractors.register(TextToSpeech, {});
player.extractors.loadMulti(DefaultExtractors);

// Debug
if (config.DevConfig.DJS_DEBUG) client.on("debug", (m) => logger.debug(m));
if (config.DevConfig.DPe_DEBUG) player.events.on("debug", (m) => logger.debug(m));
if (config.DevConfig.DP_DEBUG) {
	logger.debug(player.scanDeps());
	player.on("debug", (m) => logger.debug(m));
}
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

useGiveaways(
	config.DevConfig.Giveaway ?
		new GiveawaysManager(client, {
			storage: "./jsons/giveaways.json",
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
	useWelcome(new Collection());
	useCooldowns(new Collection());
	useResponder(new Collection());
	await Promise.all([
		loadEvents(path.join(__dirname, "events/client"), client),
		loadEvents(path.join(__dirname, "events/voice"), ziVoice),
		loadEvents(path.join(__dirname, "events/process"), process),
		loadEvents(path.join(__dirname, "events/console"), rl),
		loadEvents(path.join(__dirname, "events/player"), player.events),
		loadFiles(path.join(__dirname, "commands"), useCommands(new Collection())),
		loadFiles(path.join(__dirname, "functions"), useFunctions(new Collection())),
		startServer().catch((error) => logger.error("Error start Server:", error)),
	]);
	client.login(process.env.TOKEN).catch((error) => {
		logger.error("Error logging in:", error);
		logger.error("The Bot Token You Entered Into Your Project Is Incorrect Or Your Bot's INTENTS Are OFF!");
	});
};

initialize().catch((error) => {
	logger.error("Error during initialization:", error);
});
