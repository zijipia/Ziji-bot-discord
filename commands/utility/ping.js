const { CommandInteraction } = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, BaseInteraction } = require("discord.js");

module.exports.data = {
    name: "ping",
    description: "Xem ping của bot",
    type: 1, // slash commad
    options: [],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
}
/**
 * 
 * @param { CommandInteraction } interaction 
 */
module.exports.execute = async (interaction, lang) => {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });

    const roundTripLatency = sent.createdTimestamp - interaction.createdTimestamp;

    const botPing = interaction.client.ws.ping;

    let latencyStatus = '🟢 Excellent';
    if (botPing > 100) latencyStatus = '🟡 Good';
    if (botPing > 200) latencyStatus = '🔴 Poor';

    const informationEmbed = new EmbedBuilder()
        .setTitle('🏓 Pong!')
        .setColor('#00FFE4')
        .setDescription(`Hey ${interaction.user.username}! Here's my **latency** status:`)
        .addFields(
            { name: '🔄 Round-trip Latency', value: `${roundTripLatency}ms`, inline: true },
            { name: '🌐 WebSocket Ping', value: `${botPing}ms`, inline: true },
            { name: '📉 Latency Status', value: latencyStatus, inline: false },
        )
        .setImage('https://example.com/ping-image.png') // Optional: add a relevant image
        .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'Powered by  Gay Labs', iconURL: 'https://cdn.discordapp.com/avatars/1208465212961722379/a_52503028c37fb1a49040706395cda6c9.gif' })
        .setTimestamp();

    await interaction.editReply({ content: null, embeds: [informationEmbed] });

}
