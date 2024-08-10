const { useMainPlayer, useQueue } = require("discord-player");
const { CommandInteraction } = require("discord.js");
const player = useMainPlayer()



module.exports.data = {
    name: "player",
    description: "Gọi Player",
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
    const { client, guild } = interaction
    await interaction.deferReply();
    const queue = useQueue(guild.id);
    if (!queue) return interaction.editReply({ content: "Hiện Không Có bài hát nào đang phát" });
    queue.metadata.mess.edit({ components: [] })
    const EditMetadata = client.functions.get("EditMetadata");
    await EditMetadata.execute(guild, { mess: await interaction.fetchReply() });
    const player = client.functions.get("player_func");
    if (!player) return;
    const res = await player.execute(client, queue)
    await interaction.editReply(res);

}