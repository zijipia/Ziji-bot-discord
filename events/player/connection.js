const { GuildQueueEvent } = require("discord-player");
const { useZiVoiceExtractor } = require("@zibot/ziextractor");
const { entersState, getVoiceConnection, VoiceConnectionStatus } = require("@discordjs/voice");

const config = require("@zibot/zihooks").useConfig();

module.exports = {
	name: GuildQueueEvent.Connection,
	type: "Player",
	enable: false, //v7 not support
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

		let connection = getVoiceConnection(queue.guild.id);

		await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

		const ziVoice = useZiVoiceExtractor();
		ziVoice.handleSpeakingEvent(queue.player.client, connection, speechOptions);
	},
};
