const { Events, Client } = require("discord.js");
const config = require("../config");
const deploy = require("../deploy");

module.exports = {
    name: Events.ClientReady,
    type: "events",
    /**
     * 
     * @param {Client} client 
     */
    execute: async (client) => {
        if (config.deploy) {
            await deploy(client)
        }
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity({ name: config?.ActivityName || "ziji", type: 2 });
        client.user.setStatus(config?.Status || "online");

    }
}