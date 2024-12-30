const { Events, Message } = require("discord.js");
const { useResponder, useConfig, useFunctions } = require("@zibot/zihooks");
const config = useConfig();
module.exports = {
	name: Events.MessageCreate,
	type: "events",
	enable: config?.DevConfig?.AutoResponder,
};

/**
 * @param { Message } message
 */
module.exports.execute = async (message) => {
	if (message.author.bot || !message.guild) return;
	const parseVar = useFunctions().get("getVariable");
	const guildResponders = useResponder().get(message.guild.id) ?? [];

	const trigger = guildResponders.find((responder) => {
		const msgContent = message.content.toLowerCase();
		const triggerContent = responder.trigger.toLowerCase();

		switch (responder.matchMode) {
			case "exactly":
				return msgContent === triggerContent;
			case "startswith":
				return msgContent.startsWith(triggerContent);
			case "endswith":
				return msgContent.endsWith(triggerContent);
			case "includes":
				return msgContent.includes(triggerContent);
			default:
				return msgContent === triggerContent;
		}
	});

	if (trigger) {
		try {
			await message.reply(parseVar.execute(trigger.response, message));
		} catch (error) {
			console.error(`Failed to send response: ${error.message}`);
		}
	}
};
