const WebSocket = require("ws");
const { sendMessage } = require("../utils/sendMessage");
const config = require('config');
const archipelagoUrl = config.get('archipelagoUrl');
const _ = require("lodash");

let playerName = "";
let port = "";
let playerList = [];
let gameList = [];
let gameDataPackages = {};
let ws = "";
let key = "";
const queue = [];

let isReady = false;

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
    sendMessage("Connected to Archipelago session");
    playerList = message[0]["slot_info"];
    const payload = [
      {
        cmd: "GetDataPackage",
        games: gameList,
      },
    ];
    event.target.send(JSON.stringify(payload));
  } else if (message[0]["cmd"] == "DataPackage") {
    gameDataPackages = message[0]["data"]["games"];
    isReady = true;
    if (queue.length > 0) {
      queue.forEach((func) => func());
      queue.length = 0;
    }
  } else if (
    message[0]["cmd"] == "PrintJSON" &&
    message[0]["type"] == "ItemSend"
  ) {
    const data = message[0]["data"];
    let messageEnd = "";
    const sender = data[0]["text"];
    let receiver = "";
    if (data.length > 6) {
      receiver = data[4]["text"];
      messageEnd =
        data[3]["text"] +
        playerIdToName(data[4]["text"]) +
        data[5]["text"] +
        locationIdToName(data[6]["text"], sender) +
        data[7]["text"];
    } else {
      receiver = data[0]["text"];
      messageEnd =
        data[3]["text"] +
        locationIdToName(data[4]["text"], sender) +
        data[5]["text"];
    }

    if (data[2]["flags"] == 0) {
      sendMessage(
        playerIdToName(data[0]["text"]) +
          data[1]["text"] +
          itemIdToName(data[2]["text"], receiver) +
          messageEnd +
          " [Useless]"
      );
    } else if (data[2]["flags"] == 1) {
      sendMessage(
        playerIdToName(data[0]["text"]) +
          data[1]["text"] +
          "**" +
          itemIdToName(data[2]["text"], receiver) +
          "**" +
          messageEnd +
          " [PROGRESSIVE]"
      );
    } else if (data[2]["flags"] == 2) {
      sendMessage(
        playerIdToName(data[0]["text"]) +
          data[1]["text"] +
          "*" +
          itemIdToName(data[2]["text"], receiver) +
          "*" +
          messageEnd +
          " [Useful]"
      );
    } else if (data[2]["flags"] == 4) {
      sendMessage(
        playerIdToName(data[0]["text"]) +
          data[1]["text"] +
          "__" +
          itemIdToName(data[2]["text"], receiver) +
          "__" +
          messageEnd +
          " [Trap]"
      );
    }
  } else if (message[0]["cmd"] == "PrintJSON" && message[0]["type"] == "Goal") {
    sendMessage(message[0]["data"][0]["text"]);
  } else if (message[0]["cmd"] == "Retrieved") {
    const hints = message[0]["keys"][key];
    if (hints.length == 0) {
      _.forEach(hints, (hint) => {
        if (!hint["found"]) {
          sendMessage(
            `${playerIdToName(hint["receiving_player"])}'s ${itemIdToName(
              hint["item"],
              hint["receiving_player"]
            )} is located in ${locationIdToName(
              hint["location"],
              hint["finding_player"]
            )} in ${playerIdToName(
              hint["finding_player"]
            )}'s world (entrance: ${
              hint["entrance"] == "" ? "Vanilla" : hint["entrance"]
            })`
          );
        }
      });
    }
    else {
      sendMessage("No hints found for this player.");
    }
  } else if (message[0]["cmd"] == "ConnectionRefused") {
    sendMessage("Connection refused\n" + message[0]["errors"][0]);
    event.target.close();
    isReady = false;
  }
};

const playerIdToName = function (id) {
  return playerList[id]["name"];
};

const playerNameToId = function (name) {
  return _.findKey(playerList, (player) => player["name"] === name);
};

const itemIdToName = function (id, playerId, _gameDataPackages = gameDataPackages, _playerList = playerList, gameName = "") {
  if (gameName === "") gameName = getGameWithPlayerId(playerId, _playerList);
  const items = _gameDataPackages[gameName]["item_name_to_id"];
  return _.findKey(items, (itemId) => itemId === Number(id));
};

const locationIdToName = function (
  id,
  playerId,
  _gameDataPackages = gameDataPackages,
  _playerList = playerList,
  gameName = ""
) {
  if (gameName === "") gameName = getGameWithPlayerId(playerId, _playerList);
  const locations = _gameDataPackages[gameName]["location_name_to_id"];
  return _.findKey(locations, (locationId) => locationId === Number(id));
};

const getGameWithPlayerId = function (id, _playerList = playerList) {
  return _playerList[id]["game"];
};

module.exports = {
  getHints: function (player) {
    if (!isReady) {
      queue.push(this.getHints.bind(this, player));
      return;
    }
    key = "_read_hints_0_" + playerNameToId(player);
    const payload = [
      {
        cmd: "Get",
        keys: [key],
      },
    ];
    ws.send(JSON.stringify(payload));
  },
  startWebSocket: function (_port, _playerName) {
    playerName = _playerName;
    if (!isReady) {
      port = _port;
      ws = new WebSocket(archipelagoUrl + _port);
      ws.onmessage = onMessage;
      ws.onclose = function () {
        sendMessage("Connection closed");
        isReady = false;
      };
      ws.onerror = function (error) {
        const messageSymbol = Object.getOwnPropertySymbols(error).find(symbol => symbol.toString() === 'Symbol(kMessage)');
        const message = error[messageSymbol];
        sendMessage("Error: " + message);
        isReady = false;
      };

      setTimeout(() => {
        if (!isReady) {
          sendMessage("Connection timed out");
          ws.close();
        }
      }, 10000);
    }
  },
  stopWebSocket: function () {
    ws.close();
    isReady = false;
  },
  checkConnection(_port) {
    return isReady && port === _port;
  },
  locationIdToName: locationIdToName,
  itemIdToName: itemIdToName,
};
