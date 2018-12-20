const Command = require("../../framework/Command.js");

class Spongebob extends Command {

    constructor(...args) {
        super(...args, {
            name: "spongebob",
            description: language => language.get("COMMAND_SPONGEBOB_DESCRIPTION"),
            aliases: ["sbob", "spongebobify", "spongetext"],
            usage: "<text:string>"
        });
    }

    async run(message, [text]) {
        text = this.client.clean(message, text.split("").reduce((v, c, i) => v += c[(i % 2) ? "toLowerCase" : "toUpperCase"]()));
        message.send(text);
    }

}

module.exports = Spongebob;