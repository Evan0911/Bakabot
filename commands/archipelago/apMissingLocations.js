const { SlashCommandBuilder } = require("discord.js");
const { archipelagoUrl } = require("../../config.json");
const { sendMessage } = require("../../utils/sendMessage");
const _ = require("lodash");
const { locationIdToName } = require("../../hooks/apWebsocket");
const WebSocket = require("ws");

let playerName = "";
let playerList = [];
let missingLocations = [];
let playerId = "";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ap-missing-locations")
    .setDescription("Show all missing locations for a game")
    .addStringOption((option) =>
      option
        .setName("port")
        .setDescription("The port of the room")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("player_name")
        .setDescription("The player you want to show locations.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const port = interaction.options.getString("port");
    playerName = interaction.options.getString("player_name");
    await interaction.reply(
      `Searching for missing locations for player ${playerName}...`
    );
    ws = new WebSocket(archipelagoUrl + port);
    ws.onmessage = onMessage;
  },
};

const onMessage = function (event) {
  const message = JSON.parse(event.data);
  if (message[0]["cmd"] == "RoomInfo") {
    gameList = message[0]["games"];
    const payload = [
      {
        cmd: "Connect",
        game: "",
        name: playerName,
        password: null,
        uuid: 0,
        tags: ["AP", "TextOnly"],
        version: {
          major: 0,
          minor: 4,
          build: 4,
          class: "Version",
        },
        items_handling: 7,
      },
    ];
    event.target.send(JSON.stringify(payload));
  } else if (message[0]["cmd"] == "Connected") {
    playerList = message[0]["slot_info"];
    missingLocations = message[0]["missing_locations"]
    playerId = message[0]["slot"]
    const payload = [
      {
        cmd: "GetDataPackage",
        games: gameList,
      },
    ];
    event.target.send(JSON.stringify(payload));
  } else if (message[0]["cmd"] == "DataPackage") {
    const gameDataPackages = message[0]["data"]["games"];
    _.forEach(missingLocations, (location) => {
      sendMessage(locationIdToName(location, playerId, gameDataPackages, playerList));
    });
    event.target.close();
  } else if (message[0]["cmd"] == "ConnectionRefused") {
    sendMessage("Connection refused\n" + message[0]["errors"][0]);
    event.target.close();
  }
};
