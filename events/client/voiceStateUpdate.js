const { Events, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const config = require("@zibot/zihooks").useConfig();
const { ZiGuild } = require("../../startup/mongoDB");

module.exports = {
	name: Events.VoiceStateUpdate,
	type: "events",

	/**
	 * @param { import('discord.js').VoiceState } oldState
	 * @param { import('discord.js').VoiceState } newState
	 */

	execute: async (oldState, newState) => {
		const client = oldState.client;
		const guildId = newState.guild.id;
		const guildSetting = await ZiGuild.findOne({ guildId });

		if (guildSetting && guildSetting.voice.logMode) {
			const logChannel = newState.channel || oldState.channel;
			if (!logChannel) return;

			const channelName = newState.channel?.name || oldState.channel?.name;
			const userTag = newState.member?.user.tag || oldState.member?.user.tag;

			if (newState.channelId) {
			  // Người dùng tham gia voice channel
			  const welcomeMessages = ['<a:ZiBot_Dragon:1323313537229262940> Chào **{user}** đợi mãi mới thấy ông vào **{channel}**!', '<a:ZiBot_Dragon2:1323313583953547344> Yay, **{user}** đã tham gia **{channel}**'];
			  const randomWelcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
			  const message = randomWelcomeMsg
				.replace("{user}", userTag)
				.replace("{channel}", channelName);
			  logChannel.send(`${message}\n-# Toggle voice log by using /voice log`).catch(() => {});
			} else if (oldState.channelId) {
			  // Người dùng rời voice channel
			  const leaveMessages = ['<:ZiBot_fuckzu:1323313619676696651> **{user}** đã rời khỏi **{channel}** rồi, buồn quá  (╥﹏╥)'];
			  const randomLeaveMsg = leaveMessages[Math.floor(Math.random() * leaveMessages.length)];
			  const message = randomLeaveMsg
				.replace("{user}", userTag)
				.replace("{channel}", channelName);
			  logChannel.send(`${message}\n-# Toggle voice log by using /voice log`).catch(() => {});
			}
		}

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
