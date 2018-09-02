const { Command, RichDisplay } = require('klasa');
const { MessageAttachment } = require("discord.js");

class Achievement extends Command {

    constructor(...args) {
        super(...args, {
            name: "achievement",
            runIn: ["text"],
            requiredPermissions: ["ATTACH_FILES"],
            description: language => language.get("COMMAND_ACHIEVEMENT_DESCRIPTION"),
            usage: "<text:string>",
            extendedHelp: "No extended help available.",
        });
    }

    async run(message, [text]) {
        const body = await this.client.utils.idiotic("generators/achievement", `?avatar=${message.member.user.displayAvatarURL({ format: "png", size: 1024 })}&text=${text}`);
        await message.channel.send(new MessageAttachment(Buffer.from(body.data)));
    }

};

module.exports = Achievement;