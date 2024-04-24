const { logChannelId } = require("../config.json");

module.exports = {
  sendMessage: function (message) {
    try {
      const channel = client.channels.cache.get(logChannelId);
      channel.send(message);
    }
    catch (error) {
      console.log("bonjour c'est moi")
      console.error(error);
    }
  }
}