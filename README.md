<p align="center">
    <a href="https://discord.com/oauth2/authorize?client_id=1005716197259612193"><img src="https://img.shields.io/badge/ADD_Bot-Ziji_Bot?style=for-the-badge&label=Ziji%20Bot&color=%237289DA" alt="Add Ziji bot"></a>
    <a href="https://discord.gg/zaskhD7PTW"><img src="https://img.shields.io/discord/1007597270704869387?style=for-the-badge&color=%237289DA" alt="Ziji Discord support server"></a>
</p>

# [<img src="https://raw.githubusercontent.com/zijipia/zijipia/main/Assets/ZijiAvt.gif" width="15"/>](./) Zibot V2
Zibot is a Discord bot developed by [zijipia](https://github.com/zijipia) to enhance your Discord server with various functionalities, using [discord.js](https://discord.js.org/) and [discord-player](https://discord-player.js.org/) 
# Join [Zi bot Playground:](https://discord.gg/32GkbyXtbA) to get icon of bot.
## Features
- **Event Handling**: Respond to various Discord events.
- **Music Player**:
<p>
  <div class="image">
    <a href="./" data-sub-html="Description">
      <img alt="Player" src="https://raw.githubusercontent.com/zijipia/zijipia/Ziji-Discord-Bot-Image/Assets/Player.png" />
      <img alt="Search" src="https://github.com/zijipia/zijipia/blob/Ziji-Discord-Bot-Image/Assets/search.png" />
    </a>
  </div>
</p>


## Installation
1. Clone the repository or download project:

```bash
git clone https://github.com/zijipia/Zibot.git
cd Zibot
```
2. Install dependencies:

```bash
npm install
```
3. Set up your environment variables (e.g., TOKEN, MONGO), config:

.env:
```bash
TOKEN = "Your Bot Token" # required
MONGO = "Your Bot Mongo URI" # optional
```
config.js: In file

4. Start the bot:

```bash
node .
```

## Contributing
Contributions are welcome!

If you made some changes that you think should make it into the project, send a Pull Request on GitHub


## License
This project is licensed under the MIT License. See the [LICENSE](./blob/main/LICENSE) file for details.

## Contact
For more information, visit the [project page](https://github.com/zijipia/Ziji-bot-discord) [Support sever](https://discord.gg/GQyJkZDtdX).

***
This README provides an overview, installation steps, usage instructions, and contribution guidelines for the Zibot project.

## Testing
Ziji is testing ZiExtractor, if anything doesn't work properly try turning it off [in index.js file line 25.](https://github.com/zijipia/Ziji-bot-discord/blob/main/index.js#L25)
```js
// player.extractors.register(ZiExtractor, {});
```
