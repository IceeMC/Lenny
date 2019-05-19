const Command = require("../../framework/Command.js");

class Spongebob extends Command {

    constructor(...args) {
        super(...args, {
            name: "spongebob",
            description: language => language.get("COMMAND_SPONGEBOB_DESCRIPTION"),
            aliases: ["sbob", "spongebobify", "spongetext"],
            usage: "<text:string::all>"
        });
    }

    async run(message, [text]) {
        message.send(this.client.clean(message, text
            .split("")
            .reduce((v, c, i) => i === 0 ? c.toUpperCase() : v + (c[(i % 2) ? "toLowerCase" : "toUpperCase"]())))
        );
    }

}

module.exports = Spongebob;