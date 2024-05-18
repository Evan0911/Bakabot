const {
  SlashCommandBuilder,
} = require("discord.js");
const { PresenceUpdateStatus } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-status")
    .setDescription("Change my current status.")
    .addStringOption(option =>
      option
        .setName('status')
        .setDescription('The status to set.')
        .setRequired(true)),
  async execute(interaction) {
    client.user.setPresence({ activities: [{ name: interaction.options.getString("status") }], status: PresenceUpdateStatus.Online });
    interaction.reply({ content: `Status set to ${interaction.options.getString("status")}`, ephemeral: true })
  },
};
