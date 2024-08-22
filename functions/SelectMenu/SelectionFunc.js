const { useQueue } = require("discord-player");
const { StringSelectMenuInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports.data = {
    name: "player_SelectionFunc",
    type: "SelectMenu",
}
async function Update_Player(client, queue) {
    const player = client.functions.get("player_func");
    if (!player) return;
    const res = await player.execute(client, queue)
    queue.metadata.mess.edit(res)
}
/**
 * @param { StringSelectMenuInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
    const { guild, client, values } = interaction;
    const query = values?.at(0);
    const queue = useQueue(guild.id);
    switch (query) {
        case "Search": {

            const modal = new ModalBuilder()
                .setTitle("Search")
                .setCustomId("modal_search")
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("search-input")
                            .setLabel("Search for a song")
                            .setPlaceholder("Search or Url")
                            .setStyle(TextInputStyle.Short)
                    ))
            await interaction.showModal(modal);
            return;
        }
        case "Queue": {
            const QueueTrack = client.functions.get("Queue");
            QueueTrack.execute(interaction, queue);
            return;
        }
        case "Fillter": {
            await interaction.deferReply();
            const Fillter = client.functions.get("Fillter");
            await Fillter.execute(interaction, null);
            return;
        }
    }
    interaction.deferUpdate().catch(e => console.error);
    if (!queue) return;
    if (queue.metadata.LockStatus && queue.metadata.requestedBy?.id !== interaction.user?.id) return;
    switch (query) {
        case "Lock": {
            const EditMetadata = client.functions.get("EditMetadata");
            EditMetadata.execute(guild, { LockStatus: !queue.metadata.LockStatus });
            await Update_Player(client, queue);
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