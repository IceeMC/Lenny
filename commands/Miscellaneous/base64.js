const Command = require("../../framework/Command.js");
const base64Regex = require("base64-regex");
const encode = text => Buffer.from(text).toString("base64");
const decode = text => Buffer.from(text, "base64").toString("utf8");

class Base64 extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_BASE_64_DESCRIPTION"),
            subCommands: ["encode", "decode"],
            usage: "<type> <text:string::all>",
            aliases: ["b64"],
        });
    }

    async encode(message, [text]) {
        return message.send(this.client.utils.codeBlock(encode(text))).catch(() => {
            throw "Sorry, but the text is too long... Shorten it!";
        });
    }

    async decode(message, [text]) {
        if (!base64Regex({ exact: true }).test(text)) throw "You need to encode the text first.";
        return message.send(this.client.utils.codeBlock(decode(text)))
    }

}

module.exports = Base64;