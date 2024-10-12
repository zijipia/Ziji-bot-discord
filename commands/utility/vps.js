const { CommandInteraction, EmbedBuilder } = require("discord.js");
const os = require("os");
const { version } = require("discord.js");
const { execSync } = require("child_process");

module.exports.data = {
	name: "vps",
	description: "View information about the system.",
	type: 1, // slash command
	options: [],
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

/**
 * @param { object } command - object command
 * @param { CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	await interaction.deferReply();
	// Thông tin hệ điều hành
	const osInfo = `${os.type()} ${os.release()} ${os.arch()}`;
	// Phiên bản discord.js
	const discordJsVersion = `${version}`;
	// Lấy GitHub Commit ID
	let githubCommitId = "N/A";
	try {
		githubCommitId = execSync("git rev-parse --short HEAD").toString().trim();
	} catch (error) {
		console.error("Không thể lấy GitHub Commit ID:", error);
	}
	// Tổng số guild mà bot tham gia
	const guildCount = `${interaction.client.guilds.cache.size}`;
	// RAM đang sử dụng
	const memoryUsage = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;

	// Tạo embed để hiển thị thông tin
	const embed = new EmbedBuilder()
		.setColor("#ffcc99")
		.setTitle(lang?.BotStats?.Description)
		.addFields(
			{ name: lang?.BotStats?.OS, value: osInfo, inline: true },
			{ name: lang?.BotStats?.djsVersion, value: discordJsVersion, inline: true },
			{ name: "GitHub Commit ID", value: githubCommitId, inline: true },
			{ name: lang?.BotStats?.ServerLength, value: guildCount, inline: true },
			{ name: lang?.BotStats?.RAMUsage, value: memoryUsage, inline: true },
		)
		.setThumbnail(interaction.client.user.displayAvatarURL())
		.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
		.setTimestamp();

	// Gửi embed
	interaction.editReply({ embeds: [embed] });
};
