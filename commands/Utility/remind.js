const { Command } = require("klasa");

class Remind extends Command {

    constructor(...args) {
        super(...args, {
            name: "remind",
            runIn: ["text"],
            description: language => language.get("COMMAND_REMIND_DESCRIPTION"),
            aliases: ["remindme", "setreminder"],
            usage: "<when:time> <text:string> [...]",
            usageDelim: " "
        });
    }

    async run(message, [when, ...text]) {
        const reminder = await this.client.schedule.create("Reminder", when, {
            data: {
                channelId: message.channel.id,
                user: message.author.id,
                text: text.join(" ")
            }
        });
        return message.send(`Your reminder has been created with the ID: \`${reminder.id}\``);
    }

}

module.exports = Remind;