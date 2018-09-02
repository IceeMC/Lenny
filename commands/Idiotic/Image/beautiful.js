const { Command, RichDisplay } = require('klasa');
const { MessageAttachment } = require("discord.js");

class Beautiful extends Command {

    constructor(...args) {
        super(...args, {
            name: "beautiful",
            runIn: ["text"],
            requiredPermissions: ["ATTACH_FILES"],
            description: language => language.get("COMMAND_BEAUTIFUL_DESCRIPTION"),
            usage: "[member:membername]",
            extendedHelp: "No extended help available.",
        });
    }

    async run(message, [member]) {
        if (!member) member = message.member;
        const body = await this.client.utils.idiotic("generators/beautiful", `?avatar=${member.user.displayAvatarURL({ format: "png", size: 1024 })}`);
        await message.channel.send(new MessageAttachment(Buffer.from(body.data)));
    }

};

module.exports = Beautiful;