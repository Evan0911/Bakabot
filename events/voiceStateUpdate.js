const {
  getVoiceConnection,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const { Events } = require("discord.js");
const config = require("config");
const _ = require("lodash");
const guildId = config.get("guildId");
const path = require("path");
const fs = require('fs');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const user = oldState.member.id;
    const connection = getVoiceConnection(guildId);
    if (connection && connection.joinConfig.channelId === oldState.channelId && newState.channelId === null) {
      let isSomeoneHere = false;
      for (const member of oldState.channel.members) {
        if (!member[1].user.bot && member[1].id !== user) {
          isSomeoneHere = true;
        }
      }
      if (!isSomeoneHere) {
        connection.destroy();
      }
    }

    if (oldState.channelId === null && newState.channelId !== null) {
      if (newState.member.user.bot) return;
      fs.access('path/to/file.txt', fs.constants.F_OK, (err) => {
        if (err) {
          console.log('File does not exist');
          return;
        }
      });

      const channel = await newState.channel;
      const connection = await joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      const audioPlayer = createAudioPlayer();
      const resource = createAudioResource(
        path.join(
          __dirname,
          `../resources/soundboard/Welcome to Fun-Land Sonic.mp3`
        )
      );
      audioPlayer.play(resource);

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      // Subscribe the connection to the audio player (will play audio on the voice connection)
      connection.subscribe(audioPlayer);
    }
  },
};
