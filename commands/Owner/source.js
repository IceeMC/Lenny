const { Command } = require("klasa");

class Source extends Command {

    constructor(...args) {
        super(...args, {
            name: "source",
            aliases: ["piecesource", "src"],
            description: language => language.get("COMMAND_SOURCE_DESCRIPTION"),
            guarded: true,
            permissionLevel: 10,
            usage: "<piece:piece>"
        });
    }

    async run(message, [piece]) {
        const source = piece.constructor.toString();
        if (source.length > 1999) {
            const haste = await this.client.utils.haste(source, ".js");
            return message.send(`The output was too long to send.\nHere is the hastebin: \`${haste}\``);
        } else {
            return message.sendCode("js", source);
        }
    }

}

module.exports = Source;