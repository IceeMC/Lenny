const Command = require("../../framework/Command.js");
const { MessageAttachment } = require("discord.js");

class Achievement extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            perms: ["ATTACH_FILES"],
            description: language => language.get("COMMAND_ACHIEVEMENT_DESCRIPTION"),
            usage: "<text:string::all>",
            cooldown: 5
        });
    }

    async run(message, [text]) {
        text = this.client.clean(message, text);
        const body = await this.client.utils.idiotic("generators/achievement", `?avatar=${message.member.user.displayAvatarURL({ format: "png", size: 1024 })}&text=${text}`);
        await message.channel.send(new MessageAttachment(Buffer.from(body.data)));
    }

};

module.exports = Achievement;