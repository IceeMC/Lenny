const Command = require("../../framework/Command.js");
const { MessageAttachment } = require("discord.js");

class Bobross extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            perms: ["ATTACH_FILES"],
            description: language => language.get("COMMAND_BOBROSS_DESCRIPTION"),
            usage: "[member:member::all]",
            cooldown: 5
        });
    }

    async run(message, [member]) {
        if (!member) member = message.member;
        const body = await this.client.utils.idiotic("generators/bobross", `?avatar=${member.user.displayAvatarURL({ format: "png", size: 1024 })}`);
        await message.channel.send(new MessageAttachment(Buffer.from(body.data)));
    }

};

module.exports = Bobross;