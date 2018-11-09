const { Command, RichDisplay } = require('klasa');
const { MessageAttachment } = require("discord.js");

class Darken extends Command {

    constructor(...args) {
        super(...args, {
            name: "darken",
            runIn: ["text"],
            requiredPermissions: ["ATTACH_FILES"],
            description: language => language.get("COMMAND_DARKEN_DESCRIPTION"),
            usage: "[member:membername]",
            extendedHelp: "No extended help available.",
        });
    }

    async run(message, [member]) {
        if (!member) member = message.member;
        const body = await this.client.utils.idiotic("effects/darkness", `?avatar=${member.user.displayAvatarURL({ format: "png", size: 1024 })}&darkness=50`);
        await message.channel.send(new MessageAttachment(Buffer.from(body.data)));
    }

};

module.exports = Darken;