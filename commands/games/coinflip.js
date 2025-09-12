const { EmbedBuilder } = require("discord.js");
const { useFunctions } = require("@zibot/zihooks");

const maxBet = 250000;
const cowoncy = '💰'; // Using money emoji instead of custom cowoncy
const spin = '🪙'; // Coin emoji for spinning effect
const heads = '🔵'; // Blue circle for heads
const tails = '🔴'; // Red circle for tails

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

        // Check if user has enough money (simplified - in real implementation you'd check database)
        // For now, we'll proceed with the game

        const displayChoice = choice === "heads" ? (words.head ?? "Ngửa") : (words.tail ?? "Sấp");
        
        // Initial embed with spinning animation
        const spinningEmbed = new EmbedBuilder()
                .setTitle("🪙 Coinflip")
                .setColor("#FFD700")
                .setDescription(
                        `**${interaction.user.displayName}** đã cược **${cowoncy} ${bet.toLocaleString()}** và chọn **${displayChoice}**\n\nĐồng xu đang quay... ${spin}`
                );

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
                        resultText = `${resultEmoji} và bạn **thắng ${cowoncy} ${(bet * 2).toLocaleString()}**!!`;
                        embedColor = "#00FF00";
                        coinChange = bet;
                } else {
                        resultText = `${resultEmoji} và bạn đã **mất trắng**... 😢`;
                        embedColor = "#FF0000";
                        coinChange = -bet;
                }

                const finalEmbed = new EmbedBuilder()
                        .setTitle("🪙 Coinflip")
                        .setColor(embedColor)
                        .setDescription(
                                `**${interaction.user.displayName}** đã cược **${cowoncy} ${bet.toLocaleString()}** và chọn **${displayChoice}**\n\n` +
                                `${words.result ?? "Kết quả"}: ${resultText}`
                        );

                await message.edit({ embeds: [finalEmbed] });

                // Update user's coins
                await ZiRank.execute({ user: interaction.user, XpADD: 0, CoinADD: coinChange });
        }, 2000); // 2 second delay for suspense
};
