const { Events, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const config = require("../../config");

module.exports = {
	name: Events.VoiceStateUpdate,
	type: "events",

	/**
	 * @param { import('discord.js').VoiceState } oldState
	 * @param { import('discord.js').VoiceState } newState
	 */

	execute: async (oldState, newState) => {
		const client = oldState.client;

		const queue = useQueue(oldState?.guild?.id);

		if (!queue || !queue.metadata) return;

		const botChannel = oldState?.guild?.channels?.cache?.get(queue.dispatcher?.voiceConnection?.joinConfig?.channelId);
		if (!botChannel || botChannel.id !== oldState.channelId) return;

		const requestedMember = botChannel.members.get(queue.metadata?.requestedBy?.id);
		if (requestedMember) return;

		const nonBotMembers = botChannel.members.filter((m) => !m.user.bot);
		if (nonBotMembers.size < 1) return;

		const randomMember = nonBotMembers.random();
		const { channel, requestedBy, lang } = queue.metadata;
		const mess = await channel.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: `${client.user.username} Player:`,
						iconURL: client.user.displayAvatarURL({ size: 1024 }),
					})
					.setDescription(lang?.music?.HostLeave.replace("{HOST}", requestedBy).replace("{USER}", randomMember.user))
					.setColor("Random")
					.setImage(config.botConfig?.Banner || null)
					.setFooter({
						text: `${lang.until.goodbye} ${requestedBy?.username}`,
						iconURL: requestedBy.displayAvatarURL({ size: 1024 }),
					})
					.setTimestamp(),
			],
		});
		setTimeout(() => mess?.delete().catch(() => {}), 20_000);
		queue.metadata.requestedBy = randomMember.user;
	},
};
