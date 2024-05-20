const { getVoiceConnection } = require("@discordjs/voice");
const { Events } = require("discord.js");
const config = require("config");
const _ = require("lodash");
const guildId = config.get("guildId");

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const user = oldState.member.id;
    const connection = getVoiceConnection(guildId);
    if (connection && connection.joinConfig.channelId === oldState.channelId) {
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
  },
};
