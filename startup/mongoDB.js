const { Schema, model } = require("mongoose");

const ZiUser = Schema({
	userID: { type: String },
	name: { type: String },
	xp: { type: Number },
	level: { type: Number, default: 1 },
	coin: { type: Number, default: 1 },
	lang: { type: String },
	volume: { type: Number, default: 100 },
});

module.exports = {
	ZiUser: model("ZiUser", ZiUser),
};
