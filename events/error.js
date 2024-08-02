const { Events } = require("discord.js");
const config = require("../config");

module.exports = {
    name: Events.Error,
    type: "events",
    /**
     * 
     * @param { Error } error 
     */
    execute: async (error) => {
        console.log(error.message)
    }
}