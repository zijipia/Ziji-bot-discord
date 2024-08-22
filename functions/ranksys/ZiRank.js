const { Client, User } = require("discord.js");
const config = require("../../config");

module.exports.data = {
    name: "ZiRank",
    type: "ranksys",
};

/**
 * @param { Client } interaction 
 * @param { User } user
 */
module.exports.execute = async (client, user, xpAdd = 1) => {
    if (client?.db && user) {
        // Destructure userDB to extract values with default assignments
        const { xp = 1, level = 1, coin = 1, lang } = await client.db.ZiUser.findOne({ userID: user.id }) || {};

        // Calculate new xp
        let newXp = xp + xpAdd;
        let newLevel = level;
        let newCoin = coin;

        // Level up if the new xp exceeds the threshold
        const xpThreshold = newLevel * 50 + 1;
        if (newXp > xpThreshold) {
            newLevel += 1;
            newXp = 1;
            newCoin += newLevel * 100;
        }

        // Update the user in the database
        await client.db.ZiUser.updateOne(
            { userID: user.id },
            {
                $set: {
                    xp: newXp,
                    level: newLevel,
                    coin: newCoin
                }
            },
            { upsert: true }
        );
        const langdef = require(`./../../lang/${lang || config?.DeafultLang}`);
        return langdef;
    } else {
        // If the database is not available, just increment the user's XP and Coin
        const langdef = require(`./../../lang/${config?.DeafultLang}`);
        return langdef;
    }
};
