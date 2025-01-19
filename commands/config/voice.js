const { useDB } = require("@zibot/zihooks");

module.exports.data = {
	name: "voice",
	description: "Thiết lập lệnh voice",
	type: 1, // slash command
	options: [
		{
			name: "log",
			description: "Thông báo người tham gia kênh thoại",
			type: 1,
			options: [
				{
					name: "enabled",
					description: "Tùy chọn tắt/mở",
					type: 5, //bool
					required: true,
				},
			],
		},
	],
	integration_types: [0],
	contexts: [0],
};

module.exports.execute = async ({ interaction, lang }) => {
	const toggle = interaction.options.getBoolean("enabled");
	const guildId = interaction.guild.id;

	const DataBase = useDB();
	if (!DataBase)
		return interaction.editReply({
			content: lang?.until?.noDB || "Database hiện không được bật, xin vui lòng liên hệ dev bot",
		});

	let GuildSetting = await DataBase.ZiGuild.findOne({ guildId });
	if (!GuildSetting) {
		GuildSetting = new DataBase.ZiGuild({ guildId });
	}

	GuildSetting.voice.logMode = toggle;
	await GuildSetting.save();

	await interaction.reply({
		content: `Voice log has been ${toggle ? "enabled" : "disabled"}.`,
		ephemeral: true,
	});
};
