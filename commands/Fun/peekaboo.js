const { MessageAttachment } = require("discord.js");
const Command = require("../../framework/Command.js");

class Peekaboo extends Command {

    constructor(...args) {
        super(...args, {
            name: "peekaboo",
            description: language => language.get("COMMAND_PEEKABOO_DESCRIPTION"),
            usage: "[member:membername::all]",
            aliases: ["peek"]
        });
    }

    async run(message, [member]) {
        if (!member) member = message.author;
        const url = member.displayAvatarURL({ format: "png" });
        const file = await this.client.bananapi._get("/peek", { url }).catch(() => null);
        if (!file) throw message.language.get("BANANAPI_ERROR", "Something went really wrong, Try again later!");
        return message.send(new MessageAttachment(file, "peekaboo.png"));
    }

}

module.exports = Peekaboo;