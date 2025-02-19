const { Events, Message } = require("discord.js");
const { useResponder, useConfig, useFunctions, useLogger } = require("@zibot/zihooks");
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
	if (!message.client.isReady()) return;

	if (message.author.bot || !message.guild) return;
	if (config?.DevConfig?.AutoResponder) {
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
	}
	if (message.mentions.has(message.client.user) && !message.author.bot) {
		if (message.content.includes('<@everyone>')) return;
		const prompt = message.content.replace(`<@${message.client.user.id}>`, "").trim();
		if (!prompt) return message.reply(`Xin chào ${message.author.username}! Sử dụng \`/help\` để bắt đầu`);
		await message.channel.sendTyping();
		try {
			const result = await message.client.run(
				`Answer lower than 1500 characters\nTrả lời dưới 1500 ký tự hoặc ít hơn\nPrompt: ${prompt}`,
			);
			await message.reply(result);
		} catch (err) {
			useLogger().error(`Error in generating content: ${err}`);
			const replies = await message.reply("❌ | Không thể tạo nội dung! Xin hãy chờ ít phút");
			setTimeout(() => {
				replies.delete();
			}, 5000);
		}
	}
};
