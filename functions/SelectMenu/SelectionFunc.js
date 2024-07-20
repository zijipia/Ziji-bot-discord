const { useQueue } = require("discord-player");
const { StringSelectMenuInteraction, ModalBuilder } = require("discord.js");

module.exports.data = {
    name: "player_SelectionFunc",
    type: "SelectMenu",
}
async function Update_Player(client, queue) {
    const player = client.functions.get("player");
    if (!player) return;
    const res = await player.execute(client, queue)
    queue.metadata.mess.edit(res)
}
/**
 * @param { StringSelectMenuInteraction } interaction
 */
module.exports.execute = async (interaction) => {
    const { guild, client, values } = interaction;
    const query = values?.at(0);
    const queue = useQueue(guild.id);
    if (query == "Search") {
        const modal = new ModalBuilder()
            .setTitle("Search")
            .setCustomId("search-modal")
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("search-input")
                    .setLabel("Search for a song")
                    .setStyle(TextInputStyle.Short)
            )
        await interaction.showModal(modal);
        return;
    }
    interaction.deferUpdate().catch(e => console.error);
    if (!queue) return;
    switch (query) {
        case "Lock": {
            return;
        }
        case "Loop": {
            const repeatMode = queue.repeatMode === 0 ? 1 :
                queue.repeatMode === 1 ? 2 :
                    queue.repeatMode === 2 ? 3 : 0;
            queue.setRepeatMode(repeatMode);

            await Update_Player(client, queue);
            return;
        }
        case "AutoPlay": {
            queue.setRepeatMode(queue.repeatMode === 3 ? 0 : 3);

            await Update_Player(client, queue);
            return;
        }
        case "Queue": {
            return;
        }
        case "Mute": {
            queue.node.setVolume(0);
            await Update_Player(client, queue);
            return;
        }
        case "volinc": {
            const current_Vol = queue.node.volume;
            const Vol = Math.min(current_Vol + 10, 100);
            queue.node.setVolume(Vol);
            await Update_Player(client, queue);
            return;
        }
        case "voldec": {
            const current_Vol = queue.node.volume;
            const Vol = Math.max(current_Vol - 10, 0);
            queue.node.setVolume(Vol);
            await Update_Player(client, queue);
            return;
        }
        case "Lyrics": {
            return;
        }
        case "Shuffle": {
            queue.tracks.shuffle();
            await Update_Player(client, queue);
            return;
        }
    }

    return;
}
// const command = client.functions.get("Search");
// await command.execute(interaction, query);