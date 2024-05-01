const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    const regexOfUndertale = new RegExp(/sorry|story/gmi);
    if (regexOfUndertale.test(message.content)) {
      message.reply({content: "of Undertale", allowedMentions: {repliedUser: false}});
    }
    const likeARegex = new RegExp(/dragon/gmi);
    if (likeARegex.test(message.content)) {
      message.reply({content: "Like a what ?", allowedMentions: {repliedUser: false}});
    }
  },
};
