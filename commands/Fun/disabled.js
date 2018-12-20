const Command = require("../../framework/Command.js");
const { MessageAttachment } = require("discord.js");

class Disabled extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_DISABLED_DESCRIPTION"),
            usage: "<text:string::all[1,40]>",
            cooldown: 5
        });
    }

    async run(message, [text]) {
        const file = await this.client.bananapi.disabled(this.client.clean(message, text)).catch(() => null);
        if (!file) throw message.language.get("BANANAPI_ERROR", "Sorry, but an error occurred. Try again later.");
        return message.channel.send(new MessageAttachment(file, "disabled.png"));
    }

}

module.exports = Disabled;