const { JSX, Builder, loadImage, Font, FontFactory, adjustCanvas } = require("canvacord");

const chunkArrayInGroups = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
};

class MusicSearchCard extends Builder {
    constructor() {
        super(2000, 420);
        this.bootstrap({
            title: "",
            players: [],
        });
        if (!FontFactory.size) Font.loadDefault();
    }
    setTitle(title) {
        this.options.set("title", title);
        return this;
    }

    setPlayers(players) {
        const items = players.slice(0, 20);
        this.options.set("players", items);
        return this;
    }

    async renderDefaultPlayer({
        index,
        avatar,
        displayName,
        time,
    }) {
        let image;
        try {
            image = await loadImage(avatar);
        } catch {
            image = await loadImage("https://i.imgur.com/vhcoFZo_d.webp");
        }

        return JSX.createElement(
            "div",
            { className: "flex items-center bg-white/15 rounded-xl p-2 px-3 justify-between" },
            JSX.createElement(
                "div",
                { className: "flex justify-between items-center" },
                JSX.createElement(
                    "div",
                    { className: "flex mr-2 text-2xl w-[25px]" },
                    index
                ),
                JSX.createElement(
                    "img",
                    {
                        src: image.toDataURL(),
                        width: 49.25,
                        height: 49.58,
                        className: "rounded-full flex",
                        alt: "avatar"
                    }
                ),
                JSX.createElement(
                    "div",
                    { className: "flex flex-col justify-center ml-3" },
                    JSX.createElement(
                        "div",
                        { className: "text-xl font-semibold -mb-1 flex" },
                        displayName
                    ),
                    JSX.createElement(
                        "div",
                        { className: "text-lg font-medium text-gray-300 flex" },
                        time
                    )
                )
            ),
        );
    }

    async render() {
        const { title, players } = this.options.getOptions();
        this.width = 1000;
        this.height = 80 * Math.ceil(players.length / 2);
        this.adjustCanvas();

        const playerGroupChunks = chunkArrayInGroups(players, 10);
        const processedPlayerGroups = await Promise.all(
            playerGroupChunks.map(async (playerGroup) => {
                const renderedPlayers = await Promise.all(playerGroup.map((player) => this.renderDefaultPlayer(player)));
                return renderedPlayers;
            })
        );
        return JSX.createElement(
            "div",
            { className: "flex relative w-full flex-col" },
            JSX.createElement(
                "div",
                { className: "flex justify-center w-full m-0 my-5" },


                JSX.createElement(
                    "div",
                    { className: "flex flex-col items-center justify-center" },

                ),

            ),
            JSX.createElement(
                "div",
                { className: "flex text-white p-2 px-3", style: { gap: "6" } },
                processedPlayerGroups.map((renderedPlayers) => JSX.createElement(
                    "div",
                    { className: "flex flex-col flex-1", style: { gap: "6" } },
                    renderedPlayers
                ))
            ),

        )




    }
}

module.exports = { MusicSearchCard };
