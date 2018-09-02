const { Command, RichDisplay } = require('klasa');
const { MessageAttachment } = require("discord.js");

class Blame extends Command {

    constructor(...args) {
        super(...args, {
            name: "blame",
            runIn: ["text"],
            requiredPermissions: ["ATTACH_FILES"],
            description: language => language.get("COMMAND_BLAME_DESCRIPTION"),
            usage: "<text:string>",
            extendedHelp: "No extended help available.",
        });
    }

    async run(message, [text]) {
        const body = await this.client.utils.idiotic("generators/blame", `?name=${text}`);
        await message.channel.send(new MessageAttachment(Buffer.from(body.data)));
    }

};

module.exports = Blame;