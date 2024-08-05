const config = require("../config");
const { useMainPlayer } = require("discord-player");
const players = useMainPlayer();

module.exports = {
    name: "error",
    type: "Player",
    execute: async (queue, error) => {
        console.log("==== Error ====")
        console.log(error)
    }
}