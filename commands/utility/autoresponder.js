const { ZiAutoresponder } = require('../../startup/mongoDB')
const { PermissionsBitField } = require('discord.js')
module.exports.data = {
	name: "autoresponder",
	description: "Quản lý các autoresponder",
	type: 1, // slash command
	options: [
        {
            name: 'new',
            description: 'Tạo một autoresponder mới',
            type: 1,
            options: [
                {
                    name: 'trigger',
                    description: 'Tên của autoresponder',
                    type: 3,
                    required: true
                },
                {
                    name: 'response',
                    description: 'Phản hồi của autoresponder',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'edit',
            description: 'Sửa đổi một autoresponder có sẵn',
            type: 1,
            options: [
                {
                    name: 'trigger',
                    description: 'Tên của autoresponder',
                    type: 3,
                    required: true,
                    autocomplete: true
                },
                {
                    name: 'response',
                    description: 'Phản hồi mới của autoresponder',
                    type: 3,
                    required: true
                }
            ]
        },
    ],
	integration_types: [0],
	contexts: [0],
    default_member_permissions: "0", // chỉ có admin mới dùng được
};
/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */

module.exports.execute = async ({ interaction, lang }) => {
	if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
		return interaction.reply({ content: lang.until.noPermission, ephemeral: true });
	}

	const commandtype = interaction.options?.getSubcommand();

	switch (commandtype) {
		case "new":
			return this.newAutoRes({ interaction, lang });
		case "edit":
			return this.editAutoRes({ interaction, lang });
		default:
			return interaction.reply({ content: lang?.until?.notHavePremission, ephemeral: true });
	}
	return;
};

module.exports.newAutoRes = async ({ interaction, lang }) => {
    await interaction.deferReply()
    const trigger = interaction.options.getString('trigger');
    const response = interaction.options.getString('response');
    try {
      const newResponder = await ZiAutoresponder.create({
        guildId: interaction.guild.id,
        trigger: trigger,
        response: response,
      });

      if (!interaction.client.autoRes.has(interaction.guild.id)) {
        interaction.client.autoRes.set(interaction.guild.id, []);
      }
      interaction.client.autoRes.get(interaction.guild.id).push({
        trigger: newResponder.trigger,
        response: newResponder.response,
      });


      interaction.editReply(`Đã thêm autoresponder: Khi ai đó gửi \`${trigger}\`, bot sẽ trả lời \`${response}\`.`);
    } catch (error) {
      console.error(error);
      interaction.editReply('Đã xảy ra lỗi khi thêm autoresponder.');
    }
}