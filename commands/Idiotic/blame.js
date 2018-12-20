const Command = require("../../framework/Command.js");
const { MessageAttachment } = require("discord.js");

class Blame extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            perms: ["ATTACH_FILES"],
            description: language => language.get("COMMAND_BLAME_DESCRIPTION"),
            usage: "[text:string::all]",
            cooldown: 5
        });
    }

    async run(message, [text]) {
        if (!text) text = message.member.displayName;
        text = this.client.clean(message, text);
        const body = await this.client.utils.idiotic("generators/blame", `?name=${text}`);
        await message.channel.send(new MessageAttachment(Buffer.from(body.data)));
    }

};

module.exports = Blame;