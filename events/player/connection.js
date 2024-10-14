const { GuildQueueEvent } = require("discord-player");
const { useZiVoiceExtractor } = require("@zibot/ziextractor");
const config = require("../../config");

module.exports = {
	name: GuildQueueEvent.connection,
	type: "Player",
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
		};
		const { player, connection } = queue;
		const ziVoice = useZiVoiceExtractor();

		ziVoice.handleSpeakingEvent(player.client, connection, speechOptions);
	},
};
