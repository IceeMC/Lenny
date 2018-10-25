const { Command } = require("klasa");

class Reverse extends Command {

    constructor(...args) {
        super(...args, {
            name: "reverse",
            description: language => language.get("COMMAND_REVERSE_DESCRIPTION"),
            usasge: "<text:string>"
        });
    }

    async run(message, [text]) {
        if (text.length > 500) throw message.language.get("COMMAND_REVERSE_TEXT_TOO_LONG");
        return message.send(text.split("").reverse().join(""));
    }

}

module.exports = Reverse;