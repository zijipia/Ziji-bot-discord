const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require("discord.js");

module.exports.data = {
	name: "blackjack",
	description: "Chơi trò chơi blackjack",
	type: 1, // slash command
	options: [
		{
			name: "opponent",
			description: "Người bạn muốn thách đấu",
			type: 6,
			required: false,
		},
	],
	integration_types: [0],
	contexts: [0, 1],
};

/**
 * @param { object } command - object command
 * @param { import("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import("../../lang/vi.js") } command.lang - language
 */
module.exports.execute = async ({ interaction, lang }) => {
	const opponent = interaction.options.getUser("opponent");
	if (opponent && (opponent.bot || opponent.id === interaction.user.id))
		return interaction.reply({ content: "Bạn không thể thách đấu người này.", ephemeral: true });
	const players = [interaction.user];
	if (opponent) players.push(opponent);

	const createDeck = () => {
		const suits = ["♠️", "♥️", "♦️", "♣️"];
		const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
		const deck = [];
		for (const suit of suits) {
			for (const rank of ranks) {
				deck.push({ suit, rank });
			}
		}
		return deck;
	};

	const shuffle = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	const handValue = (hand) => {
		let value = 0;
		let aces = 0;
		for (const card of hand) {
			if (card.rank === "A") {
				value += 11;
				aces += 1;
			} else if (["K", "Q", "J"].includes(card.rank)) {
				value += 10;
			} else {
				value += Number(card.rank);
			}
		}
		while (value > 21 && aces) {
			value -= 10;
			aces -= 1;
		}
		return value;
	};

	const formatHand = (hand) => hand.map((c) => `${c.rank}${c.suit}`).join(" ");

	const deck = shuffle(createDeck());
	const dealerHand = [deck.pop(), deck.pop()];
	const playerHands = {};
	const playerStates = {};
	players.forEach((p) => {
		playerHands[p.id] = [deck.pop(), deck.pop()];
		playerStates[p.id] = { stand: false, bust: false };
	});

	const rows = [];
	const rowMap = {};
	players.forEach((p) => {
		const hitButton = new ButtonBuilder().setCustomId(`hit_${p.id}`).setLabel("Rút").setStyle(ButtonStyle.Primary);
		const standButton = new ButtonBuilder().setCustomId(`stand_${p.id}`).setLabel("Dừng").setStyle(ButtonStyle.Danger);
		const row = new ActionRowBuilder().addComponents(hitButton, standButton);
		rows.push(row);
		rowMap[p.id] = row;
	});

	const renderDescription = (revealDealer = false) => {
		const lines = players.map((p) => {
			const label = players.length === 1 ? "bạn" : p.toString();
			const hand = playerHands[p.id];
			return `**Bài của ${label}**: ${formatHand(hand)} (Tổng: ${handValue(hand)})`;
		});
		const dealerTotal = handValue(dealerHand);
		const dealerShown = revealDealer ? `${formatHand(dealerHand)} (Tổng: ${dealerTotal})` : `${formatHand([dealerHand[0]])} ??`;
		lines.push(`**Bài của nhà cái**: ${dealerShown}`);
		return lines.join("\n");
	};

	let embed = new EmbedBuilder().setTitle("Blackjack").setColor("#5865F2").setDescription(renderDescription());
	const replyPayload = { embeds: [embed], components: rows };
	if (opponent) replyPayload.content = `${opponent}, bạn được mời chơi Blackjack!`;
	await interaction.reply(replyPayload);
	const message = await interaction.fetchReply();

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 60000,
	});

	const disablePlayerButtons = (playerId) => {
		rowMap[playerId].components.forEach((btn) => btn.setDisabled(true));
	};

	const endGame = async (fields) => {
		rows.forEach((r) => r.components.forEach((btn) => btn.setDisabled(true)));
		embed = new EmbedBuilder()
			.setTitle("Blackjack")
			.setColor("#5865F2")
			.setDescription(renderDescription(true))
			.addFields(fields);
		await interaction.editReply({ embeds: [embed], components: rows });
		collector.stop("finished");
	};

	const checkEnd = async () => {
		if (Object.values(playerStates).every((s) => s.stand || s.bust)) await dealerTurn();
	};

	const dealerTurn = async () => {
		while (handValue(dealerHand) < 17) dealerHand.push(deck.pop());
		const dealerTotal = handValue(dealerHand);
		const resultFields = players.map((p) => {
			const hand = playerHands[p.id];
			const total = handValue(hand);
			let result;
			if (playerStates[p.id].bust) {
				result = "Thua";
			} else if (dealerTotal > 21 || total > dealerTotal) {
				result = "Thắng";
			} else if (total === dealerTotal) {
				result = "Hòa";
			} else {
				result = "Thua";
			}
			return { name: p.username, value: result, inline: true };
		});
		await endGame(resultFields);
	};

	collector.on("collect", async (i) => {
		const [action, playerId] = i.customId.split("_");
		if (!playerHands[playerId]) return i.reply({ content: "Nút không hợp lệ.", ephemeral: true });
		if (i.user.id !== playerId) {
			const allowed = players.map((p) => p.toString()).join(" và ");
			return i.reply({ content: `Chỉ ${allowed} mới có thể sử dụng các nút này.`, ephemeral: true });
		}
		await i.deferUpdate();
		const hand = playerHands[playerId];
		if (action === "hit") {
			hand.push(deck.pop());
			const total = handValue(hand);
			if (total > 21) {
				playerStates[playerId].bust = true;
				disablePlayerButtons(playerId);
			}
			embed = EmbedBuilder.from(embed).setDescription(renderDescription());
			await interaction.editReply({ embeds: [embed], components: rows });
			await checkEnd();
		} else if (action === "stand") {
			playerStates[playerId].stand = true;
			disablePlayerButtons(playerId);
			embed = EmbedBuilder.from(embed).setDescription(renderDescription());
			await interaction.editReply({ embeds: [embed], components: rows });
			await checkEnd();
		}
	});

	collector.on("end", async (_, reason) => {
		if (reason === "time") {
			rows.forEach((r) => r.components.forEach((btn) => btn.setDisabled(true)));
			const finalEmbed = EmbedBuilder.from(embed).setFooter({ text: "Trò chơi đã hết thời gian!" });
			await interaction.editReply({ embeds: [finalEmbed], components: rows });
		}
	});
};
