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

    async run(message, [item]) {
        const code = item.constructor ? item.constructor.toString() : item.toString();
        if (code.length > 1999) {
            const haste = await this.client.utils.haste(code, ".js");
            return message.send(`The output was too long... Uploaded to hastebin ${haste}`);
        }
        return message.send(this.client.utils.codeBlock(code, "js"));
    }

}

module.exports = Source;
