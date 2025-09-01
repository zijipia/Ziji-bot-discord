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

	const buttons = new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId("hit").setLabel("Rút").setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId("stand").setLabel("Dừng").setStyle(ButtonStyle.Danger),
	);
	let currentPlayerIndex = 0;


	const renderDescription = (revealDealer = false) => {
		const lines = players.map((p) => {
			const label = players.length === 1 ? "bạn" : p.toString();
			const hand = playerHands[p.id];
			return `**Bài của ${label}**: ${formatHand(hand)} (Tổng: ${handValue(hand)})`;
		});
		const dealerTotal = handValue(dealerHand);
		const dealerShown = revealDealer ? `${formatHand(dealerHand)} (Tổng: ${dealerTotal})` : `${formatHand([dealerHand[0]])} ??`;
		lines.push(`**Bài của nhà cái**: ${dealerShown}`);
		if (!revealDealer && players.length > 1) {
			lines.push(`**Lượt hiện tại**: ${players[currentPlayerIndex]}`);
		}

		return lines.join("\n");
	};

	let embed = new EmbedBuilder().setTitle("Blackjack").setColor("#5865F2").setDescription(renderDescription());
	const replyPayload = { embeds: [embed], components: [buttons] };

	if (opponent) replyPayload.content = `${opponent}, bạn được mời chơi Blackjack!`;
	await interaction.reply(replyPayload);
	const message = await interaction.fetchReply();

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 60000,
	});

	const endGame = async (fields) => {
		buttons.components.forEach((btn) => btn.setDisabled(true));

		embed = new EmbedBuilder()
			.setTitle("Blackjack")
			.setColor("#5865F2")
			.setDescription(renderDescription(true))
			.addFields(fields);
		await interaction.editReply({ embeds: [embed], components: [buttons] });
		collector.stop("finished");
	};
	const nextPlayer = async () => {
		currentPlayerIndex++;
		if (currentPlayerIndex >= players.length) {
			await dealerTurn();
		} else {
			embed = EmbedBuilder.from(embed).setDescription(renderDescription());
			await interaction.editReply({ embeds: [embed], components: [buttons] });
		}
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
		const player = players[currentPlayerIndex];
		if (i.user.id !== player.id) {
			return i.reply({ content: `Chỉ ${player} mới có thể sử dụng các nút này.`, ephemeral: true });
		}
		await i.deferUpdate();
		const hand = playerHands[player.id];
		if (i.customId === "hit") {
			hand.push(deck.pop());
			const total = handValue(hand);
			if (total > 21) {
				playerStates[player.id].bust = true;
				await nextPlayer();
			} else {
				embed = EmbedBuilder.from(embed).setDescription(renderDescription());
				await interaction.editReply({ embeds: [embed], components: [buttons] });
			}
		} else if (i.customId === "stand") {
			playerStates[player.id].stand = true;
			await nextPlayer();

		}
	});

	collector.on("end", async (_, reason) => {
		if (reason === "time") {
			buttons.components.forEach((btn) => btn.setDisabled(true));
			const finalEmbed = EmbedBuilder.from(embed).setFooter({ text: "Trò chơi đã hết thời gian!" });
			await interaction.editReply({ embeds: [finalEmbed], components: [buttons] });

		}
	});
};
