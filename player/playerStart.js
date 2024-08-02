const { useMainPlayer } = require("discord-player");
const config = require("../config");
const { EmbedBuilder } = require("discord.js");
const players = useMainPlayer();
module.exports = {
    name: "playerStart",
    type: "Player",
    execute: async (queue, track) => {
        const player = players.client.functions.get("player_func");

        if (!player) return;
        const res = await player.execute(players.client, queue, track)
        if (queue.metadata.mess)
            return queue.metadata.mess.edit(res)
    }
}
