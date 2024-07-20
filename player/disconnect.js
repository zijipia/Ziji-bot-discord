const config = require("../config");

module.exports = {
    name: "disconnect",
    type: "Player",
    execute: async (queue) => {
        if (queue.metadata.mess)
            return queue.metadata.mess.edit({ components: [] }).catch(e => { });
    }
}