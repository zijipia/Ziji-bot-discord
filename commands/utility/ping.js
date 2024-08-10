const { CommandInteraction } = require("discord.js");



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
    const ping = interaction.client.ws.ping;
    interaction.reply(`Ping: ${ping}`);
    return;
}