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
    .setName("ap-stats")
    .setDescription("Show stats for the specified  player.")
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
    await interaction.reply({content: `Searching for stats for player ${playerName}...`, ephemeral: true});
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
    const stats = Math.round(message[0]["checked_locations"].length / (message[0]["missing_locations"].length + message[0]["checked_locations"].length) * 100);
    sendMessage(playerName + " checked " + stats + "% of their locations.");
    event.target.close();
  } else if (message[0]["cmd"] == "ConnectionRefused") {
    sendMessage("Connection refused\n" + message[0]["errors"][0]);
    event.target.close();
  }
};
