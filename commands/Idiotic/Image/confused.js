const { Command, RichDisplay } = require('klasa');
const { MessageAttachment } = require("discord.js");

class Confused extends Command {

    constructor(...args) {
        super(...args, {
            name: "confused",
            runIn: ["text"],
            requiredPermissions: ["ATTACH_FILES"],
            description: language => language.get("COMMAND_CONFUSED_DESCRIPTION"),
            usage: "[member:membername]",
            extendedHelp: "No extended help available.",
        });
    }

    async run(message, [member]) {
        if (!member) member = message.member;
        const randomMember = message.guild.members.filter(member => member.user !== message.author).random();
        const body = await this.client.utils.idiotic("generators/confused", `?avatar=${member.user.displayAvatarURL({ format: "png", size: 1024 })}&photo=${randomMember.user.displayAvatarURL({ format: "png", size: 1024})}`);
        await message.channel.send(new MessageAttachment(Buffer.from(body.data)));
    }

};

module.exports = Confused;