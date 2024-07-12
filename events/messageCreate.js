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
    const wiresRegex = new RegExp(/wires|wire/gmi);
    if (wiresRegex.test(message.content)) {
      message.reply({content: "https://static.wikia.nocookie.net/silly-cat/images/4/4f/Wire_Cat.png/revision/latest/thumbnail/width/360/height/360?cb=20231001190626", allowedMentions: {repliedUser: false}});
    }
  },
};
