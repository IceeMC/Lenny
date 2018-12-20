const { MessageAttachment } = require("discord.js");
const Command = require("../../framework/Command.js");

class Headache extends Command {

    constructor(...args) {
        super(...args, {
            name: "headache",
            description: language => language.get("COMMAND_HEADACHE_DESCRIPTION"),
            usasge: "<text:string>"
        });
    }

    async run(message, [text]) {
        const file = await this.client.bananapi.headache(this.client.clean(message, text)).catch(() => null);
        if (!file) throw message.language.get("BANANAPI_ERROR", "Please shorten the text to 25 characters or less!");
        return message.send(new MessageAttachment(file, "headache.png"));
    }

}

module.exports = Headache;