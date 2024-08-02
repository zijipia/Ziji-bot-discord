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
module.exports.execute = async (interaction) => {
    const { client, guild } = interaction
    interaction.deferReply();
    const queue = useQueue(guild.id);
    if (!queue) return interaction.editReply({ content: "Hiện Không Có bài hát nào đang phát" });
    queue.metadata.mess.edit({ components: [] })
    const EditMetadata = client.functions.get("EditMetadata");
    await EditMetadata.execute(guild, { mess: await interaction.fetchReply() });
    const player = client.functions.get("player_func");
    if (!player) return;
    const res = await player.execute(client, queue)
    await interaction.editReply(res)
    const entry = queue.tasksQueue.acquire();
    await entry.getTask();
    try {
        // if player node was not previously playing, play a song
        if (!queue.isPlaying()) await queue.node.play();
    } finally {
        // release the task we acquired to let other tasks to be executed
        // make sure you are releasing your entry, otherwise your bot won't
        // accept new play requests
        queue.tasksQueue.release();
    }

}