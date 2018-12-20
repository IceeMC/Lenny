const Command = require("../../framework/Command.js");
const superagent = require("superagent");
const { MessageAttachment } = require("discord.js");

class Magik extends Command {

    constructor(...args) {
        super(...args, {
            name: "magik",
            runIn: ["text"],
            description: language => language.get("COMMAND_MAGIK_DESCRIPTION"),
            usage: "[member:member::all]",
            usageDelim: " "
        });
    }

    async run(message, [member]) {
        if (!member) member = message.member;
        const image = member.user.displayAvatarURL({ format: "png", size: 2048 });
        const { body: { message: url } } = (await superagent.get("https://nekobot.xyz/api/imagegen").query({ type: "magik", image }));
        const { body: buf } = (await superagent.get(url));
        message.channel.send(new MessageAttachment(Buffer.from(buf), "magik.png"));
    }

}

module.exports = Magik;