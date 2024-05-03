const {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require('config');
const soundboardChannelId = config.get('soundboardChannelId');
const evieId = config.get('evieId');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("soundboard")
    .setDescription("Send soundboard buttons to the channel."),
  async execute(interaction) {
    if (interaction.member.id != evieId) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
      return;
    }
    if (interaction.channelId != soundboardChannelId) {
      await interaction.reply({
        content: `You must be in the <#${soundboardChannelId}> channel to use this command.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({
      ephemeral: true,
    });

    // Delete the current soundboard
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    for (const message of messages.values()) {
      await message.delete();
    }

    const files = getFiles(path.join(__dirname, "../../resources/soundboard"));

    if (files.length == 0) {
      await interaction.channel.followUp("No files found.");
      return;
    }

    // While there are files to send
    while (files.length > 0) {
      // Create a row and send it
      const rows = [];
      for (let i = 0; i < 5 && files.length != 0; i++) {
        const row = new ActionRowBuilder();
        for (let i = 0; i < 5 && files.length != 0; i++) {
          const file = files.pop().split("/").pop().split(".")[0];
          const button = new ButtonBuilder()
            .setCustomId(`soundboard_${file}`)
            .setLabel(file)
            .setStyle("Secondary");
          row.addComponents(button);
        }
        rows.push(row);
      }
      await interaction.channel.send({
        content: "Soundboard:",
        components: rows,
      });
    }
    await interaction.deleteReply();
  },
};

// Recursive function to get files
function getFiles(dir) {
  const files = [];
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir);
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    // Check if the current file/directory is a directory using fs.statSync
    if (
      fs.statSync(name).isFile() &&
      (name.endsWith(".mp3") || name.endsWith(".wav") || name.endsWith(".ogg"))
    ) {
      // If it is a file, push the full path to the files array
      files.push(name);
    }
  }
  return files;
}
