const { ActionRowBuilder } = require('discord.js');
const { ButtonBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('soundboard')
		.setDescription('Send soundboard buttons to the channel.'),
	async execute(interaction) {
    const files = getFiles(path.join(__dirname, '../../resources/soundboard'))

    if(files.length == 0) {
      await interaction.reply('No files found.')
      return
    }
    
    // While there are files to send
    while(files.length > 0) {
      // Create a row and send it
      const row = new ActionRowBuilder()
      for (let i = 0; i < 5 && files.length != 0; i++) {
        const file = files.pop().split('/').pop().split('.')[0]
        const button = new ButtonBuilder().setCustomId(file).setLabel(file).setStyle('Secondary')
        row.addComponents(button)
      }
      await interaction.channel.send({ content: 'Soundboard:', components: [row] })
    }
    await interaction.reply({content: 'Soundboard buttons sent.', ephemeral: true})
	},
};

// Recursive function to get files
function getFiles(dir) {
  const files = []
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir)
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isFile() && (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg'))) {
      // If it is a file, push the full path to the files array
      files.push(name)
    }
  }
  return files
}