const Command = require("../../framework/Command.js");
const { createHash } = require("crypto");
const subCommands = [
    "md4",
    "md5",
    "mdc2",
    "ripemd",
    "ripemd160",
    "rmd160",
    "sha1",
    "sha224",
    "sha256",
    "sha384",
    "sha512",
    "whirlpool"
];

class Hash extends Command {

    constructor(...args) {
        super(...args, {
            name: "hash",
            description: language => language.get("COMMAND_HASH_DESCRIPTION"),
            subCommands,
            usage: "<type> <text:string::all>",
            aliases: ["texthash", "hashmytext"],
        });
    }

    async run(message, [type, text]) {
        if (type === "whirlpool" && ("rsa" in message.flags)) throw "`whirlpool` does not support RSA encryption.";
        if (type === "rmd160" && ("rsa" in message.flags)) throw "`rmd160` does not support RSA encryption.";
        type = ("rsa" in message.flags) ? `${type}WithRSAEncryption` : type;
        return message.send(this.client.utils.codeBlock(createHash(type).update(text).digest("hex")));
    }

}

module.exports = Hash;