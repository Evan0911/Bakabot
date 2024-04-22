const { SlashCommandBuilder } = require("discord.js");
const { logChannelId } = require("../../config.json");
const WebSocket = require("ws");
const _ = require("lodash");

let playerName = "";
let players = [];
let gameList = [];
let gameDataPackages = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ap-connect")
    .setDescription("Connect to an Archipelago session")
    .addStringOption((option) =>
      option
        .setName("port")
        .setDescription("The port of the room")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("player_name")
        .setDescription("The player you want to connect as.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const port = interaction.options.getString("port");
    playerName = interaction.options.getString("player_name");
    interaction.reply(
      `Connecting to Archipelago session on port ${port} as ${playerName}...`
    );
    wsLogs = new WebSocket(`ws://localhost:${port}`);
    wsLogs.onmessage = onMessageLogs;
  },
};

const onMessageLogs = async function (event) {
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
    sendMessage("Connected to Archipelago session");
    players = message[0]["slot_info"];
    const payload = [
      {
        cmd: "GetDataPackage",
        games: gameList,
      },
    ];
    event.target.send(JSON.stringify(payload));
  }
  else if (message[0]["cmd"] == "DataPackage") {
    gameDataPackages = message[0]["data"]["games"];
  }
   else if (message[0]["cmd"] == "ConnectionRefused") {
    sendMessage("Connection refused\n" + message[0]["errors"][0]);
    event.target.close();
  } else if (
    message[0]["cmd"] == "PrintJSON" &&
    message[0]["type"] == "ItemSend"
  ) {
    const data = message[0]["data"];
    let messageEnd = "";
    let player = "";
    if (data.length > 6) {
      player = data[4]["text"];
      messageEnd =
        data[3]["text"] +
        playerIdToName(data[4]["text"]) +
        data[5]["text"] +
        locationIdToName(data[6]["text"], player) +
        data[7]["text"];
    } else {
      player = data[0]["text"];
      messageEnd =
        data[3]["text"] + locationIdToName(data[4]["text"], player) + data[5]["text"];
    }

    if (data[2]["flags"] == 0) {
      sendMessage(
        playerIdToName(data[0]["text"]) +
          data[1]["text"] +
          itemIdToName(data[2]["text"], player) +
          messageEnd +
          " [Useless]"
      );
    } else if (data[2]["flags"] == 1) {
      sendMessage(
        playerIdToName(data[0]["text"]) +
          data[1]["text"] +
          "**" +
          itemIdToName(data[2]["text"], player) +
          "**" +
          messageEnd +
          " [PROGRESSIVE]"
      );
    } else if (data[2]["flags"] == 2) {
      sendMessage(
        playerIdToName(data[0]["text"]) +
          data[1]["text"] +
          "*" +
          itemIdToName(data[2]["text"], player) +
          "*" +
          messageEnd +
          " [Useful]"
      );
    } else if (data[2]["flags"] == 4) {
      sendMessage(
        playerIdToName(data[0]["text"]) +
          data[1]["text"] +
          "__" +
          itemIdToName(data[2]["text"], player) +
          "__" +
          messageEnd +
          " [Trap]"
      );
    }
  } else if (message[0]["cmd"] == "PrintJSON" && message[0]["type"] == "Goal") {
    sendMessage(message[0]["data"][0]["text"]);
  }
};

const sendMessage = function (message) {
  const channel = client.channels.cache.get(logChannelId);
  channel.send(message);
};

const playerIdToName = function (id) {
  return players[id]["name"];
};

const itemIdToName = function (id, playerId) {
  const gameName = getGameWithPlayerId(playerId);
  const items = gameDataPackages[gameName]["item_name_to_id"];
  return _.findKey(items, itemId => itemId === Number(id));
};

const locationIdToName = function (id, playerId) 
{
  const gameName = getGameWithPlayerId(playerId);
  const locations = gameDataPackages[gameName]["location_name_to_id"];
  return _.findKey(locations, locationId => locationId === Number(id));
};

const getGameWithPlayerId = function (id) {
  return players[id]["game"];
};
