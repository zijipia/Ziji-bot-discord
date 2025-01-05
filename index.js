require("dotenv").config();
const {
	useClient,
	useCooldowns,
	useCommands,
	useFunctions,
	useGiveaways,
	useConfig,
	useResponder,
	useWelcome,
} = require("@zibot/zihooks");
const path = require("node:path");
const { Player } = require("discord-player");
const config = useConfig(require("./config"));
const { GiveawaysManager } = require("discord-giveaways");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { loadFiles, loadEvents } = require("./startup/loader.js");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { ZiExtractor, useZiVoiceExtractor, TextToSpeech } = require("@zibot/ziextractor");

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
	allowedMentions: {
		parse: ["users"],
		repliedUser: false,
	},
});

if (config.DevConfig.ai && process.env?.GEMINI_API_KEY?.length) {
	const { GoogleGenerativeAI } = require("@google/generative-ai");
	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
	client.run = async (prompt) => {
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();
		return text;
	};
}

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
			storage: "./giveaways.json",
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
		loadEvents(path.join(__dirname, "events/player"), player.events),
		loadFiles(path.join(__dirname, "commands"), useCommands(new Collection())),
		loadFiles(path.join(__dirname, "functions"), useFunctions(new Collection())),
	]);

	client.login(process.env.TOKEN).catch((error) => {
		console.error("Error logging in:", error);
		console.error("The Bot Token You Entered Into Your Project Is Incorrect Or Your Bot's INTENTS Are OFF!");
	});
};

initialize().catch((error) => {
	console.error("Error during initialization:", error);
});
