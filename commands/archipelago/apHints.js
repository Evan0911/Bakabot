const { SlashCommandBuilder } = require("discord.js");
const apWebsocket = require("../../hooks/apWebsocket");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ap-hints")
    .setDescription("Show all hinted locations for a game")
    .addStringOption((option) =>
      option
        .setName("port")
        .setDescription("The port of the room")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("player_name")
        .setDescription("The player you want to show hints.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const port = interaction.options.getString("port");
    playerName = interaction.options.getString("player_name");
    await interaction.reply(
      `Searching for hints for player ${playerName}...`
    );
    if(!apWebsocket.checkConnection(port)) {
      apWebsocket.startWebSocket(port, playerName);
    }
    apWebsocket.getHints(playerName);
  },
};