const Command = require("../../framework/Command.js");

class Emojify extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_EMOJIFY_DESCRIPTION"),
            usage: "<text:string::all[1,50]>",
        });
        this.emojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣"];
    }

    async run(message, [text]) {
        return message.send(this.client.clean(message, text)
            .replace(/([A-Za-z])/g, (_, char) => {
                if (char.match(/(:|<|>)/)) return " ";
                return `:regional_indicator_${char.toLowerCase()}: `;
            })
            .replace(/0/g, ":zero: ")
            .replace(/([1-9])/g, (_, num) => `${this.emojis[parseInt(num)]} `)
        );
    }

}

module.exports = Emojify;