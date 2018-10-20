const { Task } = require("klasa");

class Reminder extends Task {

    async run({ channelId, user, text }) {
        const channel = this.client.channels.get(channelId);
        return channel.send(`<@${user}>, Here is the reminder you set: ${text}`);
    }

}

module.exports = Reminder;