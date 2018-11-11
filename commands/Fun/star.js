const { Command, util: { codeBlock } } = require("klasa");
const range = num => Array.from(Array(num).keys());

class Star extends Command {

    constructor(...args) {
        super(...args, {
            name: "star",
            runIn: ["text", "dm"],
            description: message => message.language.get("COMMAND_STAR_DESCRIPTION"),
            usage: "<text:string{2,26}>"
        });
    }

    run(message, [text]) {
        const star = codeBlock("", this.generateStar(text));
        return message[message.channel.type === "dm" ? "author" : "channel"].send(star);
    }

    generateStar(text) {
        let star = "";
        const middle = text.length - 1;
        for (const i of range(text.length * 2 - 1)) {
            if (middle === i) {
                star += `${text.split("").reverse().join("")}${text.slice(1)}\n`;
            } else {
                const splits = text.split("");
                const c = Math.abs(middle - i);
                star += " ".repeat(middle - c);
                star += splits[c];
                star += " ".repeat(c - 1);
                star += splits[c];
                star += " ".repeat(c - 1);
                star += splits[c];
                star += "\n";
            }
        }
        return star;
    }

}

module.exports = Star;