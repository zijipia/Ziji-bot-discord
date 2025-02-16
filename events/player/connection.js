const { GuildQueueEvent } = require("discord-player");
const { useZiVoiceExtractor } = require("@zibot/ziextractor");
const { entersState, VoiceConnectionStatus } = require("@discordjs/voice");

const config = require("@zibot/zihooks").useConfig();

module.exports = {
	name: GuildQueueEvent.Connection,
	type: "Player",
	enable: true, //v7 not support
	/**
	 *
	 * @param { import('discord-player').GuildQueue } queue
	 */

	execute: async (queue) => {
		if (!queue?.metadata?.voiceAssistance || !config?.DevConfig.VoiceExtractor) return;
		const speechOptions = {
			ignoreBots: true,
			minimalVoiceMessageDuration: 1,
			lang: queue?.metadata?.lang?.local_names || "vi-VN",
			focusUser: queue?.metadata?.focus || "", //user id
		};

		try {
			await entersState(queue.connection, VoiceConnectionStatus.Ready, 20_000);
		} catch (error) {
			console.error("Failed to enter ready state:", error);
			connection.destroy();
			return;
		}
		console.log(" ready state: OK");

		const ziVoice = useZiVoiceExtractor();
		ziVoice.handleSpeakingEvent(queue.player.client, queue.connection, speechOptions);
	},
};
