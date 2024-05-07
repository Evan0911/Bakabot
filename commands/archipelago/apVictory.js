const { SlashCommandBuilder } = require("discord.js");
const config = require('config');
const archipelagoUrl = config.get('archipelagoUrl');
const WebSocket = require("ws");
const { ButtonBuilder } = require("discord.js");
const { ActionRowBuilder } = require("discord.js");

let playerName = "";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ap-victory")
    .setDescription("Send the victory state to a game (use wisely)")
    .addStringOption((option) =>
      option
        .setName("port")
        .setDescription("The port of the room")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("player_name")
        .setDescription("The player you want to set as finished state.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const port = interaction.options.getString("port");
    playerName = interaction.options.getString("player_name");

    const confirmButton = new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Confirm")
      .setStyle("Danger");
    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle("Secondary");
    const row = new ActionRowBuilder().addComponents(
      confirmButton,
      cancelButton
    );

    const response = await interaction.reply({
      content: `Are you sure you want to give up player ${playerName} ?`,
      ephemeral: true,
      components: [row],
    });

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60_000,
      });
      if (confirmation.customId === "confirm") {
        ws = new WebSocket(archipelagoUrl + port);
        ws.onmessage = onMessage;
      }
      else {
        await interaction.editReply({
          content: "Cancelled",
          components: [],
        });
      }
    } catch (e) {
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
        components: [],
      });
    }
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
    const payload = [
      {
        cmd: "StatusUpdate",
        status: 30,
      },
    ];
    event.target.send(JSON.stringify(payload));
  } else if (message[0]["cmd"] == "ConnectionRefused") {
    sendMessage("Connection refused\n" + message[0]["errors"][0]);
    event.target.close();
  }
};
