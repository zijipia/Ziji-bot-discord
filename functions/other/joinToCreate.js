const { useFunctions, useConfig } = require("@zibot/zihooks");
const {
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ChannelType,
	PermissionFlagsBits,
	ComponentType,
} = require("discord.js");

module.exports.data = {
	name: "joinToCreate",
	type: "other",
};
let message;
let channelOwner;
let isCurrentlyHidden;

/**
 * Main execute function
 */
/**
 * Hàm để thay thế các biến trong chuỗi bằng giá trị thực tế.
/**
 * @param { import('discord.js').VoiceState } oldState
 * @param { import('discord.js').VoiceState } newState
 */
module.exports.execute = async (oldState, newState, guildSetting) => {
	// Người dùng join vào kênh JTC
	if (newState.channelId === guildSetting.joinToCreate.voiceChannelId) {
		const channel = await newState.guild.channels.create({
			name: `${newState.member.user.username}'s channel`,
			type: ChannelType.GuildVoice,
			parent: guildSetting.joinToCreate.categoryId || newState.member.voice.channel?.parentId,
			userLimit: guildSetting.joinToCreate.defaultUserLimit || newState.member.voice.channel?.userLimit,
			permissionOverwrites: [
				{
					id: newState.member.id,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.ManageChannels,
						PermissionFlagsBits.DeafenMembers,
						PermissionFlagsBits.MuteMembers,
						PermissionFlagsBits.MoveMembers,
					],
				},
				{
					id: newState.guild.id,
					allow: [PermissionFlagsBits.ViewChannel],
				},
			],
		});
		// Cập nhật database
		guildSetting.joinToCreate.tempChannels.push({
			channelId: channel.id,
			ownerId: newState.member.user.id,
			locked: false,
		});
		await guildSetting.save();
		await newState.member.voice.setChannel(channel);

		const managerEmbed = new EmbedBuilder()
			.setTitle("Quản lý phòng")
			.setDescription(`Xin chào **${newState.member.user.username}**! Hãy sử dụng các nút để điều khiển phòng thoại nhé`)
			.setColor("Random")
			.setImage(useConfig().botConfig?.Banner)
			.setFooter({ text: "Nhấn các nút bên dưới để sử dụng giao diện" })
			.setTimestamp();

		const row1 = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId("B_TempVoice_Lock").setLabel("🔒 Khóa/Mở khóa").setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("B_TempVoice_Hide").setLabel("👁️ Ẩn/Hiện kênh thoại").setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("B_TempVoice_Kick").setLabel("👢 Đuổi người dùng").setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId("B_TempVoice_Limit").setLabel("👥 Giới hạn người dùng").setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId("B_TempVoice_Rename").setLabel("✏️ Đổi tên").setStyle(ButtonStyle.Success),
		);

		message = await newState.channel.send({
			content: "",
			embeds: [managerEmbed],
			components: [row1],
		});

		//     const collector = message.createMessageComponentCollector({
		//         componentType: ComponentType.Button,
		//         time: 3600000,
		//     });

		//     collector.on("collect", async (interaction) => {
		//         if (interaction.user.id !== newState.member.id) {
		//             return interaction.reply({
		//                 content: "Bạn không có quyền điều khiển kênh này!",
		//                 ephemeral: true,
		//             });
		//         }

		//         const tempChannel = guildSetting.joinToCreate.tempChannels.find(
		//             (ch) => ch.channelId === channel.id
		//         );
		//         if (!tempChannel) return;

		//         const currentPermissions = channel.permissionOverwrites.cache.get(newState.guild.id);
		//         isCurrentlyHidden = currentPermissions?.deny?.has(PermissionFlagsBits.ViewChannel);

		//         switch (interaction.customId) {
		//             case "B_TempVoice_Lock":
		//                 tempChannel.locked = !tempChannel.locked;
		//                 await channel.permissionOverwrites.edit(newState.guild.id, {
		//                     Connect: !tempChannel.locked,
		//                 });
		//                 await interaction.reply({
		//                     content: `Kênh thoại đã ${tempChannel.locked ? "bị khóa" : "được mở khóa"}.`,
		//                     ephemeral: true,
		//                 });
		//                 break;

		//             case "B_TempVoice_Hide":
		//                 await channel.permissionOverwrites.edit(newState.guild.id, {
		//                     ViewChannel: isCurrentlyHidden,
		//                 });
		//                 await interaction.reply({
		//                     content: `Kênh thoại đã được ${isCurrentlyHidden ? "hiển thị" : "ẩn"}.`,
		//                     ephemeral: true,
		//                 });
		//                 break;

		//             case "B_TempVoice_Kick": {
		//                 const modal = new ModalBuilder()
		//                     .setCustomId("M_TempVoice_Kick")
		//                     .setTitle("Đuổi người dùng")
		//                     .addComponents(
		//                         new ActionRowBuilder().addComponents(
		//                             new TextInputBuilder()
		//                                 .setCustomId("kickUserId")
		//                                 .setLabel("Nhập ID người dùng:")
		//                                 .setStyle(TextInputStyle.Short)
		//                                 .setRequired(true)
		//                         )
		//                     );
		//                 await interaction.showModal(modal);
		//                 break;
		//             }

		//             case "B_TempVoice_Limit": {
		//                 const modal = new ModalBuilder()
		//                     .setCustomId("M_TempVoice_limit")
		//                     .setTitle("Giới hạn người dùng")
		//                     .addComponents(
		//                         new ActionRowBuilder().addComponents(
		//                             new TextInputBuilder()
		//                                 .setCustomId("userLimit")
		//                                 .setLabel("Nhập giới hạn số người dùng:")
		//                                 .setMinLength(0)
		//                                 .setMaxLength(99)
		//                                 .setStyle(TextInputStyle.Short)
		//                                 .setRequired(true)
		//                         )
		//                     );
		//                 await interaction.showModal(modal);
		//                 break;
		//             }

		//             case "B_TempVoice_Rename": {
		//                 const modal = new ModalBuilder()
		//                     .setCustomId("M_TempVoice_Rename")
		//                     .setTitle("Đổi tên kênh thoại")
		//                     .addComponents(
		//                         new ActionRowBuilder().addComponents(
		//                             new TextInputBuilder()
		//                                 .setCustomId("newChannelName")
		//                                 .setLabel("Nhập tên mới cho kênh thoại:")
		//                                 .setStyle(TextInputStyle.Short)
		//                                 .setRequired(true)
		//                         )
		//                     );
		//                 await interaction.showModal(modal);
		//                 break;
		//             }

		//             default:
		//                 await interaction.reply({ content: "Nút không hợp lệ.", ephemeral: true });
		//         }
		//         channelOwner = newState.member;
		//         await guildSetting.save();
		//     });

		//     collector.on("end", async () => {
		//         await message.edit({ components: [] });
		//     });
	}

	// Xóa kênh nếu trống
	if (oldState.channelId) {
		const tempChannel = guildSetting.joinToCreate.tempChannels.find((ch) => ch.channelId === oldState.channelId);
		if (tempChannel) {
			const channel = oldState.guild.channels.cache.get(oldState.channelId);
			if (channel?.members.filter((member) => !member.user.bot).size === 0) {
				await channel.delete().catch(() => {});
				guildSetting.joinToCreate.tempChannels = guildSetting.joinToCreate.tempChannels.filter(
					(ch) => ch.channelId !== oldState.channelId,
				);
				await guildSetting.save();
			}
		}
	}
};
