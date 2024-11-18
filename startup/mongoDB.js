const { Schema, model } = require("mongoose");

const ZiUser = Schema({
	userID: { type: String },
	name: { type: String },
	xp: { type: Number },
	level: { type: Number, default: 1 },
	coin: { type: Number, default: 1 },
	lang: { type: String },
	volume: { type: Number, default: 100 },
	color: { type: String, default: "Random" },
});

const ZiAutoresopnder = Schema(
	{
		guildId: { type: String, required: true },
		trigger: { type: String, required: true },
		response: { type: String, required: true },
		options: {
			matchMode: { type: String, enum: ["exactly", "startswith", "endswith", "includes"], default: "exactly" },
		},
	},
	{
		timestamps: true,
	},
);

module.exports = {
	ZiUser: model("ZiUser", ZiUser),
	ZiAutoresponder: model("ZiAutoresponder", ZiAutoresopnder),
};
