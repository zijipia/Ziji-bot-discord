const config = require("../config");

module.exports = {
    name: "emptyChannel",
    type: "Player",
    execute: async (queue) => {
        if (queue.metadata.mess)
            return queue.metadata.mess.edit({ components: [] }).catch(e => { });
    }
}