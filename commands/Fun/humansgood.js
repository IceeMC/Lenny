const { MessageAttachment } = require("discord.js");
const { Command } = require("klasa");

class HumansGood extends Command {

    constructor(...args) {
        super(...args, {
            name: "humansgood",
            description: language => language.get("COMMAND_HUMANSGOOD_DESCRIPTION"),
            usasge: "<text:string>",
            aliases: ["hoomans", "hoomansgood"]
        });
    }

    async run(message, [text]) {
        const file = await this.client.bananapi.humansgood(text).catch(() => null);
        if (!file) throw message.language.get("BANANAPI_ERROR", "Please shorten the text to 32 characters or less!");
        return message.send(new MessageAttachment(file, "humansgood.png"));
    }

}

module.exports = HumansGood;