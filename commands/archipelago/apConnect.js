const { SlashCommandBuilder } = require("discord.js");
const apWebsocket = require("../../hooks/apWebsocket");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ap-connect")
    .setDescription("Connect to an Archipelago session")
    .addStringOption((option) =>
      option
        .setName("port")
        .setDescription("The port of the room")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("player_name")
        .setDescription("The player you want to connect as.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const port = interaction.options.getString("port");
    const playerName = interaction.options.getString("player_name");
    await interaction.reply(
      `Connecting to Archipelago session on port ${port} as ${playerName}...`
    );
    if (!apWebsocket.checkConnection(port)) {
      apWebsocket.startWebSocket(port, playerName);
    }
  },
};