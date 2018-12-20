const { MessageAttachment } = require("discord.js");
const Command = require("../../framework/Command.js");

class Spit extends Command {

    constructor(...args) {
        super(...args, {
            name: "splits",
            description: language => language.get("COMMAND_SPLIT_DESCRIPTION"),
            usage: "[member:member::all]",
            aliases: ["split"]
        });
    }

    async run(message, [member]) {
        const firstImage = message.member.displayAvatarURL({ format: "png" });
        const secondImage = member.displayAvatarURL({ format: "png" });
        const file = await this.client.bananapi._get("/spit", { firstImage, secondImage }).catch(() => null);
        if (!file) throw message.language.get("BANANAPI_ERROR", "Something went really wrong, Try again later!");
        return message.send(new MessageAttachment(file, "split.png"));
    }

}

module.exports = Spit;