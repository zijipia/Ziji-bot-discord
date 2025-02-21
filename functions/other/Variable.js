const { CommandInteraction, ChatInputCommandInteraction, Message, GuildMember } = require("discord.js");
module.exports.data = {
	name: "getVariable",
	type: "other",
};

/**
 * @param {string} template
 * @param {CommandInteraction | ChatInputCommandInteraction | Message | GuildMember} instance
 * @returns {string}
 */
module.exports.execute = (template, instance) => {
	if (!instance) return template;
	let user = null;
	let server = null;
	if (instance.isCommand?.() || instance.isModalSubmit?.() || instance.isMessageComponent?.()) {
		user = instance.user;
		server = instance.guild;
	} else if (instance instanceof Message) {
		user = instance.author;
		server = instance.guild;
	} else if (instance instanceof GuildMember) {
		user = instance.user;
		server = instance.guild;
	}
	if (!user || !server) return template;
	const memberCountNoBots = server.members.cache.filter((member) => !member.user.bot).size;
	return template
		.replace(/{user}/g, `<@${user.id}>`)
		.replace(/{user_tag}/g, `${user.tag}`)
		.replace(/{user_name}/g, `${user.username}`)
		.replace(/{user_id}/g, `${user.id}`)
		.replace(/{user_avatar}/g, `${user.displayAvatarURL()}`)
		.replace(/{server_name}/g, `${server.name}`)
		.replace(/{server_id}/g, `${server.id}`)
		.replace(/{server_membercount}/g, `${server.memberCount}`)
		.replace(/{server_membercount_nobots}/g, `${memberCountNoBots}`);
};
