const config = require("../config");
const { useMainPlayer, GuildQueueEvent } = require("discord-player");
const players = useMainPlayer();

module.exports = {
    name: GuildQueueEvent.error,
    type: "Player",
    execute: async (queue, error) => {
        console.log("==== Error ====")
        console.log(error)
    }
}