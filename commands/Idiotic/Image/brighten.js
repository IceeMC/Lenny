const { Command, RichDisplay } = require('klasa');
const { MessageAttachment } = require("discord.js");

class Brighten extends Command {

    constructor(...args) {
        super(...args, {
            name: "brighten",
            runIn: ["text"],
            requiredPermissions: ["ATTACH_FILES"],
            description: language => language.get("COMMAND_BRIGHTEN_DESCRIPTION"),
            usage: "[member:membername]",
            extendedHelp: "No extended help available.",
        });
    }

    async run(message, [member]) {
        if (!member) member = message.member;
        const body = await this.client.utils.idiotic("effects/brightness", `?avatar=${member.user.displayAvatarURL({ format: "png", size: 1024 })}&brightness=50`);
        await message.channel.send(new MessageAttachment(Buffer.from(body.data)));
    }

};

module.exports = Brighten;