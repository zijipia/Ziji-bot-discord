const config = require("../../config");
const { useClient } = require("@zibot/zihooks");

module.exports.data = {
	name: "ZiRank",
	type: "ranksys",
};

/**
 * @param { import ("discord.js").User } user
 * @param { Number } XpADD
 */

module.exports.execute = async ({ client, user, XpADD = 1 }) => {
	const clients = client || useClient();
	if (clients?.db && user) {
		// Destructure userDB to extract values with default assignments
		const { xp = 1, level = 1, coin = 1, lang } = (await clients.db.ZiUser.findOne({ userID: user.id })) || {};

		// Calculate new xp
		let newXp = xp + XpADD;
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
		await clients.db.ZiUser.updateOne(
			{ userID: user.id },
			{
				$set: {
					xp: newXp,
					level: newLevel,
					coin: newCoin,
				},
			},
			{ upsert: true },
		);
		const langdef = require(`./../../lang/${lang || config?.DeafultLang}`);
		return langdef;
	} else {
		// If the database is not available, just increment the user's XP and Coin
		const langdef = require(`./../../lang/${config?.DeafultLang}`);
		return langdef;
	}
};
