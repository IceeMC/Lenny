const { MessageAttachment } = require("discord.js");
const { Command } = require("klasa");

class Disabled extends Command {

    constructor(...args) {
        super(...args, {
            name: "disabled",
            description: language => language.get("COMMAND_DISABLED_DESCRIPTION"),
            usasge: "<text:string>"
        });
    }

    async run(message, [text]) {
        const file = await this.client.bananapi.disabled(text).catch(() => null);
        if (!file) throw message.language.get("BANANAPI_ERROR", "Please shorten the text to 40 characters or less!");
        return message.send(new MessageAttachment(file, "disabled.png"));
    }

}

module.exports = Disabled;