const { EmbedBuilder } = require("discord.js");
const { useFunctions } = require("@zibot/zihooks");

const maxBet = 250000;
const zigold = '🪙'; // ZiGold emoji
const spin = '🔄'; // Spinning emoji for animation
const heads = '🟦'; // Blue square for heads
const tails = '🟥'; // Red square for tails

module.exports.data = {
        name: "coinflip",
        description: "Trò chơi tung đồng xu với hệ thống cược",
        type: 1,
        options: [
                {
                        name: "side",
                        description: "Chọn mặt đồng xu",
                        type: 3,
                        required: true,
                        choices: [
                                { name: "Ngửa (Heads)", value: "heads" },
                                { name: "Sấp (Tails)", value: "tails" },
                        ],
                },
                {
                        name: "bet",
                        description: "Số tiền cược (mặc định: 100)",
                        type: 4,
                        required: false,
                        min_value: 1,
                        max_value: maxBet,
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
        let bet = interaction.options.getInteger("bet") || 100;
        const words = lang?.Coinflip ?? {};

        // Validate bet amount
        if (bet <= 0) {
                const errorEmbed = new EmbedBuilder()
                        .setTitle("❌ Lỗi")
                        .setColor("#FF0000")
                        .setDescription("Bạn không thể cược số tiền <= 0!");
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (bet > maxBet) {
                bet = maxBet;
        }

        // Check if user has enough ZiGold
        const { useDB } = require("@zibot/zihooks");
        const DataBase = useDB();
        let userBalance = 0;
        
        if (DataBase) {
                const userDB = await DataBase.ZiUser.findOne({ userID: interaction.user.id });
                userBalance = userDB?.coin || 0;
        }

        if (userBalance < bet) {
                const errorEmbed = new EmbedBuilder()
                        .setTitle("❌ Không đủ ZiGold")
                        .setColor("#FF0000")
                        .setDescription(`Bạn không có đủ ZiGold để cược! Bạn có **${userBalance.toLocaleString()} ZiGold** nhưng cần **${bet.toLocaleString()} ZiGold**.`)
                        .addFields({
                                name: "💡 Gợi ý",
                                value: "Sử dụng `/zigold` để kiểm tra số dư hoặc chơi các trò chơi khác để kiếm ZiGold!"
                        });
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const displayChoice = choice === "heads" ? (words.head ?? "Ngửa") : (words.tail ?? "Sấp");
        
        // Initial embed with spinning animation
        const spinningEmbed = new EmbedBuilder()
                .setTitle(`${zigold} ZiGold Coinflip`)
                .setColor("#FFD700")
                .setDescription(
                        `**${interaction.user.displayName}** đã cược **${zigold} ${bet.toLocaleString()} ZiGold** và chọn **${displayChoice}**\n\n${spin} Đồng xu đang quay...`
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        const message = await interaction.reply({ embeds: [spinningEmbed] });

        // Simulate coin flip delay
        setTimeout(async () => {
                const result = Math.random() < 0.5 ? "heads" : "tails";
                const win = choice === result;
                const displayResult = result === "heads" ? (words.head ?? "Ngửa") : (words.tail ?? "Sấp");
                const resultEmoji = result === "heads" ? heads : tails;
                
                let resultText = "";
                let embedColor = "";
                let coinChange = 0;

                if (win) {
                        resultText = `${resultEmoji} **${displayResult}** - Bạn thắng **${zigold} ${bet.toLocaleString()} ZiGold**!`;
                        embedColor = "#00FF00";
                        coinChange = bet;
                } else {
                        resultText = `${resultEmoji} **${displayResult}** - Bạn thua **${zigold} ${bet.toLocaleString()} ZiGold**... 😢`;
                        embedColor = "#FF0000";
                        coinChange = -bet;
                }

                // Calculate new balance
                const newBalance = userBalance + coinChange;

                const finalEmbed = new EmbedBuilder()
                        .setTitle(`${zigold} ZiGold Coinflip - Kết quả`)
                        .setColor(embedColor)
                        .setDescription(
                                `**${interaction.user.displayName}** đã cược **${zigold} ${bet.toLocaleString()} ZiGold** và chọn **${displayChoice}**\n\n` +
                                `🎯 ${words.result ?? "Kết quả"}: ${resultText}\n\n` +
                                `💰 Số dư mới: **${newBalance.toLocaleString()} ZiGold**`
                        )
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

                await message.edit({ embeds: [finalEmbed] });

                // Update user's coins and give 1 XP for playing
                await ZiRank.execute({ user: interaction.user, XpADD: 1, CoinADD: coinChange });
        }, 2000); // 2 second delay for suspense
};
