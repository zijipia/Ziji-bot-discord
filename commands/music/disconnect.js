const { useMainPlayer, useQueue } = require("discord-player");
const { CommandInteraction } = require("discord.js");
const player = useMainPlayer()



module.exports.data = {
    name: "disconnect",
    description: "Tắt nhạc và rời khỏi kênh thoại",
    type: 1, // slash commad
    options: [],
    integration_types: [0],
    contexts: [0],
}
/**
 * 
 * @param { CommandInteraction } interaction 
 */
module.exports.execute = async (interaction, lang) => {
    await interaction.deferReply();
    const queue = useQueue(interaction.guild.id);
    if (!queue) {
        await interaction?.guild?.members?.me?.voice?.disconnect();
        await interaction.editReply("Đã ngắt kết nói");
        return
    }
    if (queue.metadata.LockStatus && queue.metadata.requestedBy?.id !== interaction.user?.id) return;
    await queue?.metadata?.mess?.edit({ components: [] }).catch(e => { })
    queue.delete();
    await interaction.editReply("Đã tắt nhạc");

}