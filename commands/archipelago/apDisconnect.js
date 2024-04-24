const { SlashCommandBuilder } = require("discord.js");
const apWebsocket = require("../../hooks/apWebsocket");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ap-disconnect")
    .setDescription("Disconnect from the Archipelago session"),
  async execute(interaction) {
    await interaction.reply("Disconnected from Archipelago session.");
    apWebsocket.disconnect();
  },
};