const Command = require("../../framework/Command.js");
const { MessageAttachment } = require("discord.js");

class Crush extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            perms: ["ATTACH_FILES"],
            description: language => language.get("COMMAND_CRUSH_DESCRIPTION"),
            usage: "<member:member::all>",
            cooldown: 5
        });
    }

    async run(message, [...inp]) {
        const body = await this.client.utils.idiotic("generators/crush", `?avatar=${message.member.user.displayAvatarURL({ format: "png", size: 1024 })}&photo=${member.user.displayAvatarURL({ format: "png", size: 1024})}`);
        await message.channel.send(new MessageAttachment(Buffer.from(body.data)));
    }

};

module.exports = Crush;