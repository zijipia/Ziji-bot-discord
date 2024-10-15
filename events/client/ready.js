const { Events, Client, ActivityType } = require("discord.js");
const config = require("../../config");
const deploy = require("../../startup/deploy");
const mongoose = require("mongoose");
const { useDB } = require("@zibot/zihooks");

module.exports = {
	name: Events.ClientReady,
	type: "events",
	once: true,
	/**
	 * @param { Client } client
	 */
	execute: async (client) => {
		/**
		 * @param { String } messenger
		 */
		client.errorLog = async (messenger) => {
			if (!config?.botConfig?.ErrorLog) return;
			try {
				const channel = await client.channels.fetch(config?.botConfig?.ErrorLog).catch(() => 0);
				if (channel) {
					const text = `[<t:${Math.floor(Date.now() / 1000)}:R>] ${messenger}`;
					for (let i = 0; i < text.length; i += 1000) {
						await channel?.send(text.slice(i, i + 1000)).catch(() => {});
					}
				}
			} catch (error) {
				console.error("Lỗi khi gửi tin nhắn lỗi:", error);
			}
		};

		// Deploy Commands
		if (config?.deploy) {
			await deploy(client);
		}

		// Connect MongoDB
		if (process.env.MONGO) {
			await mongoose
				.connect(process.env.MONGO)
				.then(() => {
					console.log("Connected to MongoDB!");
					client.errorLog(`Connected to MongoDB!`);
					useDB(require("../../startup/mongoDB"));
				})
				.catch(() => useDB(() => false));
		} else {
			useDB(() => false);
		}

		// set Activity status
		client.user.setStatus(config?.botConfig?.Status || "online");
		client.user.setActivity({
			name: config?.botConfig?.ActivityName || "ziji",
			type: ActivityType[config?.botConfig?.ActivityType] || ActivityType.Playing,
			timestamps: {
				start: Date.now(),
			},
		});

		// Ready !!!
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.errorLog(`Ready! Logged in as ${client.user.tag}`);
	},
};
