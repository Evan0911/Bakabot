const reminders = [];

const checkEndDate = () => {
  const now = new Date(); // current date
  now.setSeconds(0);
  
  reminders.forEach((reminder, index) => {
    if (reminder.date === now.toString()) {
      try {
        const channel = client.channels.cache.get("771328486178291758");
        channel.send(`<@${reminder.user}> ${reminder.message}`);
        reminders.splice(index, 1);
      }
      catch (error) {
        console.error(error);
      }
    }
  });

  // call this function again in 1min
  setTimeout(checkEndDate, 60000);
}

module.exports = {
  checkEndDate: checkEndDate,

  addReminder: (user, date, message) => {
    reminders.push({
      user: user,
      date: date,
      message: message,
    });
  }
}
