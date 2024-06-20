const { SlashCommandBuilder } = require("discord.js");
const { addReminder } = require("../../hooks/reminderCheck.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a reminder for yourself")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("in_x_minutes")
        .setDescription("Set a reminder for yourself in x minutes")
        .addStringOption((option) =>
          option
            .setName("minutes")
            .setDescription("The time to wait before reminding you")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to remind you with")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("at_x_date")
        .setDescription("Set a reminder for yourself at x time")
        .addStringOption((option) =>
          option
            .setName("date")
            .setDescription(
              "The date to remind you at (YYYY-MM-DDTHH:mm:ss.sssZ)"
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to remind you with")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "in_x_minutes") {
      const minutes = interaction.options.getString("minutes");
      const message = interaction.options.getString("message");
      const date = new Date(new Date().getTime() + minutes * 60000);
      date.setSeconds(0);

      console.log(date.toString());

      addReminder(interaction.user.id, date.toString(), message);
    } else if (subcommand === "at_x_date") {
      const date = new Date(interaction.options.getString("date"));
      date.setSeconds(0);
      const message = interaction.options.getString("message");

      console.log(date.toString());

      addReminder(interaction.user.id, date.toString(), message);
    }
    interaction.reply({ content: "Reminder set!", ephemeral: true})
  },
};