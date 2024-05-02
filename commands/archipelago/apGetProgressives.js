const { SlashCommandBuilder } = require("discord.js");
const config = require('config');
const archipelagoUrl = config.get('archipelagoUrl');

const { sendMessage } = require("../../utils/sendMessage");
const _ = require("lodash");
const { itemIdToName } = require("../../hooks/apWebsocket");
const WebSocket = require("ws");

let playerName = "";
let playerList = [];
let progressivesItems = [];
let playerId = "";
let gameName = "";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ap-get-progressives")
    .setDescription("Show all progressives items that a player received")
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
    await interaction.reply(`Searching for items for player ${playerName}...`);
    ws = new WebSocket(archipelagoUrl + port);
    ws.onmessage = onMessage;
  },
};

const onMessage = function (event) {
  const message = JSON.parse(event.data);
  if (message[0]["cmd"] == "RoomInfo") {
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
    playerId = message[0]["slot"];
    gameName = message[0]["slot_info"][playerId]["game"]
    const payload = [
      {
        cmd: "GetDataPackage",
        games: [gameName],
      },
    ];
    event.target.send(JSON.stringify(payload));
  } else if (message[0]["cmd"] == "DataPackage") {
    const gameDataPackages = message[0]["data"]["games"];
    if (progressivesItems.length > 0) {
      _.forEach(progressivesItems, (item) => {
        sendMessage(itemIdToName(item["item"], playerId, gameDataPackages, playerList, gameName));
      });
    }
    else {
      sendMessage("No progressives items received by " + playerName);
    }
    event.target.close();
  } else if (message[0]["cmd"] == "ConnectionRefused") {
    sendMessage("Connection refused\n" + message[0]["errors"][0]);
    event.target.close();
  }
  if (message[1] && message[1]["cmd"] == "ReceivedItems") {
    progressivesItems = _.filter(
      message[1]["items"],
      (item) => item["flags"] == 1
    );
  }
};
