const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('brain-cell')
		.setDescription('Who 🎵 goes 🎵 the brain cell ? 🎵'),
	async execute(interaction) {
    const bakas = ["221994237816864768", "198180737420230656", "115868786770313224"]
    await interaction.reply(`<@${bakas[Math.floor(Math.random() * bakas.length)]}> got the brain cell for now !`);
	},
};