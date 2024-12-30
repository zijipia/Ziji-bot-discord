const { ApplicationCommandOptionType } = require("discord.js");
const { ZiGuild } = require('../../startup/mongoDB')
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
                    name: 'enabled',
                    description: 'Tùy chọn tắt/mở',
                    type: ApplicationCommandOptionType.Boolean,
                    required: true,
                }
            ]
		},
	],
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

module.exports.execute = async ({ interaction, lang }) => {
    const toggle = interaction.options.getBoolean('enabled');
    const guildId = interaction.guild.id;

    let GuildSetting = await ZiGuild.findOne({ guildId });
    if (!GuildSetting) {
        GuildSetting = new ZiGuild({ guildId });
    }

    GuildSetting.voice.logMode = toggle;
    await GuildSetting.save();

    await interaction.reply({
      content: `Voice log has been ${toggle ? 'enabled' : 'disabled'}.`,
      ephemeral: true,
    });
}