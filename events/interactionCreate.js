const { Events } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { createAudioPlayer, createAudioResource } = require("@discordjs/voice");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isButton()) {
      file = fs.readFileSync(
        path.join(
          __dirname,
          "../resources/soundboard/",
          `${interaction.customId}.mp3`
        )
      );

      if (!file) {
        await interaction.reply("File not found.");
        return;
      }

      if (!interaction.member.voice.channel) {
        await interaction.reply(
          "You must be in a voice channel to use this command."
        );
        return;
      }

      const channel = await interaction.member.voice.channel;
      const connection = await channel.joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

			const audioPlayer = createAudioPlayer();
			const resource = createAudioResource(file.split('/').pop());
			audioPlayer.play(resource);

      // Subscribe the connection to the audio player (will play audio on the voice connection)
      const subscription = connection.subscribe(audioPlayer);
    }
  },
};
