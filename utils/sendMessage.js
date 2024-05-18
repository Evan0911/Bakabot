const config = require('config');
const logChannelId = config.get('logChannelId');

module.exports = {
  sendMessage: function (message) {
    try {
      const channel = client.channels.cache.get(logChannelId);
      channel.send(message);
    }
    catch (error) {
      console.error(error);
    }
  }
}