const { SlashCommandBuilder } = require("discord.js");
const config = require("config");
const archipelagoUrl = config.get("archipelagoUrl");

const { sendMessage } = require("../../utils/sendMessage");
const _ = require("lodash");
const WebSocket = require("ws");

let playerName = "";
let key = "";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ap-settings")
    .setDescription("Show settings for the specified  player.")
    .addStringOption((option) =>
      option
        .setName("port")
        .setDescription("The port of the room")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("player_name")
        .setDescription("The player you want to show settings.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const port = interaction.options.getString("port");
    playerName = interaction.options.getString("player_name");
    await interaction.reply({
      content: `Searching for settings for player ${playerName}...`,
      ephemeral: true,
    });
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
    const playerList = message[0]["slot_info"];
    key = `_read_slot_data_${_.findKey(playerList, (player) => player["name"] === playerName)}`;
    const payload = [
      {
        cmd: "Get",
        keys: [key],
      },
    ];
    event.target.send(JSON.stringify(payload));
  } else if (message[0]["cmd"] == "Retrieved") {
    sendMessage("```JSON\n" + JSON.stringify(message[0]["keys"][key], null, "\t") + "```");
    event.target.close();
  } else if (message[0]["cmd"] == "ConnectionRefused") {
    sendMessage("Connection refused\n" + message[0]["errors"][0]);
    event.target.close();
  }
};