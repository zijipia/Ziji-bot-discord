const { EmbedBuilder } = require("discord.js");
const { useFunctions, useDB } = require("@zibot/zihooks");

const zigoldEmoji = '🪙'; // ZiGold emoji
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BASE_DAILY_REWARD = 500;

module.exports.data = {
        name: "daily",
        description: "Nhận phần thưởng ZiGold hàng ngày",
        type: 1,
        options: [],
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
        const DataBase = useDB();
        
        if (!DataBase) {
                const errorEmbed = new EmbedBuilder()
                        .setTitle("❌ Lỗi Database")
                        .setColor("#FF0000")
                        .setDescription("Không thể kết nối đến database. Vui lòng thử lại sau!");
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const userDB = await DataBase.ZiUser.findOne({ userID: interaction.user.id });
        const now = new Date();
        const lastDaily = userDB?.lastDaily ? new Date(userDB.lastDaily) : null;

        // Check if user can claim daily reward
        if (lastDaily && (now.getTime() - lastDaily.getTime()) < DAILY_COOLDOWN) {
                const timeLeft = DAILY_COOLDOWN - (now.getTime() - lastDaily.getTime());
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                
                const errorEmbed = new EmbedBuilder()
                        .setTitle("⏰ Daily Reward - Cooldown")
                        .setColor("#FFA500")
                        .setDescription(`Bạn đã nhận phần thưởng daily hôm nay rồi!`)
                        .addFields({
                                name: "⏳ Thời gian còn lại",
                                value: `${hoursLeft} giờ ${minutesLeft} phút`,
                                inline: true
                        })
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));
                        
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Calculate reward based on user level
        const userLevel = userDB?.level || 1;
        const levelBonus = userLevel * 50;
        const totalReward = BASE_DAILY_REWARD + levelBonus;

        // Update user's last daily claim time
        await DataBase.ZiUser.updateOne(
                { userID: interaction.user.id },
                {
                        $set: {
                                lastDaily: now,
                        },
                },
                { upsert: true }
        );

        // Give the reward
        await ZiRank.execute({ user: interaction.user, XpADD: 10, CoinADD: totalReward });

        // Get updated balance
        const updatedUserDB = await DataBase.ZiUser.findOne({ userID: interaction.user.id });
        const newBalance = updatedUserDB?.coin || 0;

        const successEmbed = new EmbedBuilder()
                .setTitle(`${zigoldEmoji} Daily Reward Claimed!`)
                .setColor("#00FF00")
                .setDescription(`**${interaction.user.displayName}** đã nhận được phần thưởng daily!`)
                .addFields(
                        {
                                name: "💰 ZiGold nhận được",
                                value: `${totalReward.toLocaleString()}`,
                                inline: true
                        },
                        {
                                name: "✨ XP nhận được",
                                value: "10",
                                inline: true
                        },
                        {
                                name: "🏦 Số dư mới",
                                value: `${newBalance.toLocaleString()} ZiGold`,
                                inline: true
                        }
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                        text: `Quay lại vào ngày mai để nhận thêm phần thưởng! Level bonus: +${levelBonus}`,
                        iconURL: interaction.client.user.displayAvatarURL()
                });

        await interaction.reply({ embeds: [successEmbed] });
};