const { Command } = require("klasa");
const { MessageEmbed } = require("discord.js");
const { get } = require("superagent");

class Emojify extends Command {

    constructor(...args) {
        super(...args, {
            name: "emojify",
            description: language => language.get("COMMAND_EMOJIFY_DESCRIPTION"),
            usage: "<text:string>"
        });
        this.numbers = {
            0: "zero",
            1: "one",
            2: "two",
            3: "three",
            4: "four",
            5: "five",
            6: "six",
            7: "seven",
            8: "eight",
            9: "nine"
        };
    }

    async run(message, [text]) {
        return message.send(text
            .replace(/([A-Za-z])/g, (match, char) => {
                if (char.match(/(:|<|>)/)) return " ";
                return `:regional_indicator_${char.toLowerCase()}: `;
            })
            .replace(/[0-9]/g, (match, num) => { return `:${this.numbers[parseInt(num)]}: `; })
        ).catch(() => {
            throw "Message content to long. Please make it shorter!";
        })
    }

}

module.exports = Emojify;