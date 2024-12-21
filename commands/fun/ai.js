const { useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "ai",
	description: "Tính năng AI",
	type: 1, // slash command
	options: [
		{
			name: "ask",
			description: "Hỏi AI",
			type: 1,
			options: [
				{
					name: "prompt",
					description: "Tin nhắn để gửi",
					type: 3,
					channel_types: [0],
					required: true,
				},
			],
		},
		{
			name: "assistant",
			description: "Kích hoạt AI trong phòng voice",
			type: 1,
		},
	],
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferReply();
	const command = interaction.options.getSubcommand();

	switch (command) {
		case "ask":
			const command = useFunctions().get("runAI");
			const prompt = interaction.options.getString("prompt");
			await command.execute(interaction, prompt);
			break;
		case "assistant":
			const command1 = useFunctions().get("runVoiceAI");
			await command1.execute(interaction);
			break;
	}
	return;
};

