const Command = require("../../framework/Command.js");
const ArgResolver = require("../../framework/ArgResolver");

class Source extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ["src"],
            runIn: ["text"],
            description: "Gets the source for an item.",
            check: 10,
            noHelp: true,
            usage: "<item:item>"
        });
    }

    async run(message, [src]) {
        src = ArgResolver.fromStore(message, src);
        const constructorCode = src.constructor.toString();
        if (constructorCode.length > 1999) {
            const haste = await this.client.utils.haste(constructorCode, ".js");
            return message.send(`The output was too long... Uploaded to hastebin ${haste}`);
        }
        return message.send(this.client.utils.codeBlock(constructorCode, "js"));
    }

}

module.exports = Source;