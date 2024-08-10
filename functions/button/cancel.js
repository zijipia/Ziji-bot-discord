const { ButtonInteraction } = require("discord.js");

module.exports.data = {
    name: "cancel",
    type: "button",
}
/**
 * 
 * @param { ButtonInteraction } interaction 
 * @returns 
 */
module.exports.execute = async (interaction, lang) => {
    interaction.message.delete().catch(e => { })
    return;
}