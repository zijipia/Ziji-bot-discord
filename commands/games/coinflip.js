const { EmbedBuilder } = require("discord.js");
const { useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "coinflip",
	description: "Trò chơi tung đồng xu",
	type: 1,
	options: [
		{
			name: "side",
			description: "Chọn mặt đồng xu",
			type: 3,
			required: true,
			choices: [
				{ name: "Ngửa", value: "heads" },
				{ name: "Sấp", value: "tails" },
			],
		},
	],
	integration_types: [0],
	contexts: [0, 1],
};

/**
 * @param { object } command - object command
 * @param { import("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import("../../lang/vi.js") } command.lang - language
 */
module.exports.execute = async ({ interaction, lang }) => {
	const ZiRank = useFunctions().get("ZiRank");
	const choice = interaction.options.getString("side");
	const result = Math.random() < 0.5 ? "heads" : "tails";
	const win = choice === result;
	const words = lang?.Coinflip ?? {};
	const displayChoice = choice === "heads" ? (words.head ?? "Heads") : (words.tail ?? "Tails");
	const displayResult = result === "heads" ? (words.head ?? "Heads") : (words.tail ?? "Tails");
	const message = win ? (words.win ?? "You guessed correctly!") : (words.lose ?? "You guessed wrong!");

	const embed = new EmbedBuilder()
		.setTitle("Coinflip")
		.setColor("#5865F2")
		.setDescription(
			`${words.chosen ?? "Bạn chọn"}: **${displayChoice}**\n${words.result ?? "Kết quả"}: **${displayResult}**\n${message}`,
		);

	await interaction.reply({ embeds: [embed] });
	const CoinADD = win ? 100 : -100;
	await ZiRank.execute({ user: interaction.user, XpADD: 0, CoinADD });
};
