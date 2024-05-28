# Presentation
Bakabot is a utility bot made primarely for a personnal usage. Its purpose is to provide command to help us monitore our game on [Archipelago](https://archipelago.gg), a multiworld mutligame randomizer, and some other things.

### What is Archipelago ?
Archipelago is a multiworld and multigame randomizer. It is really fun and I can't recommand you enough to try it out with friends

# Setup
*For now, the setup is quite tedious. I really hope to simplify it in the future and hopefully provide a Docker image.*

First, you will need to create some config in a `config` folder and call it `default.json` (note that you can replace the Archipelago server URL by whatever URL you host your game in). Replace each value by your own.
You can also create dedicated config in files such as `develoment.json` or `production.json` and use it by setting NODE_ENV to the apropriate value, `develoment` or `production` in the previously mentionned examples (see [node-config](https://www.npmjs.com/package/node-config) for more detail).
```JSON
{
  "token": "YOUR_BOT_TOKEN",
  "clientId": "YOUR_BOT_CLIENT_ID",
  "guildId": "YOUR_DISCORD_SERVER_ID",
  "archipelagoUrl": "wss://archipelago.gg:",
  "logChannelId": "THE_CHANNEL'S_ID_IN_WHICH_YOU_WANT_TO_SEND_LOGS",
  "adminId": "YOUR_BOT_ADMINISTRATOR'S_ID",
  "soundboardChannelId": "CHANNEL_TO_DISPLAY_THE_SOUNDBOARD"
}
```

# Commands
As of 28/05/2024 (dd/mm/yyyy) the commands available on bakabot are the following :
- `ap-connect` which is used to connect to an AP (Archipelago) game and log received items
- `ap-disconnect` which disconnect Bakabot from the AP server
- `ap-hints` which gives a list of hints that a player have
- `ap-get-progressives` which gives a list of progressives items that a player have
- `ap-missing-locations` which gives a list of locations that a player has not checked yet
- `ap-victory` send a victory status to the archipelago server for the specified player
- `ap-settings` return every settings stored in the DataStorage in Archipelago server for a specified player
- `ping` which ping Bakabot
- `reload` which reload a command without the need of restarting Bakabot
- `soundboard` create a soundboard with all the .mp3 files in the folder `resources/soundboard` in a specified channel (ony usable by the bot admin at the moment)
