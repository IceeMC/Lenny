const { Command } = require("klasa");

class Hash extends Command {

    constructor(...args) {
        super(...args, {
            name: "hash",
            description: language => language.get("COMMAND_HASH_DESCRIPTION"),
            aliases: ["md5", "createhash", "hashtext", "texthash"],
            usasge: "<text:string>"
        });
    }

    async run(message, [text]) {
        const hash = await this.client.bananapi.hash({ text });
        message.send(hash);
    }

}

module.exports = Hash;