const Command = require("../../framework/Command.js");
const { MessageEmbed }  = require("discord.js");

class Regex extends Command {

    constructor(...args) {
        super(...args, {
            noHelp: true,
            check: 10,
            aliases: ["rgx", "regexp"],
            usage: "<pattern:string> <input:string::all>",
            runIn: ["text"],
            description: "Tests regular expressions with the provided search string, and flags (if provided).",
        });
    }

    async run(message, [pattern, input]) {
        const patternRegex = new RegExp(pattern.startsWith("/") && pattern.endsWith("/") ? pattern.slice(1, -1) : pattern);
        console.log(patternRegex);
        const patternExec = patternRegex.exec(input);
        if (!("test" in message.flags)) {
            if (!patternExec) return message.send(new MessageEmbed()
                .setTitle("Error")
                .setDescription("No matches found.")
                .setColor(0xFF0000)
            );
            const matches = patternExec.map((m, i) => `**${i+1}** - ${m}`);
            return message.send(new MessageEmbed()
                .setTitle("Success")
                .setColor(this.client.utils.color)
                .setDescription(`
**Pattern:**
\`${pattern.startsWith("/") && pattern.endsWith("/") ? pattern : `/${pattern}/`}\`

**Input:**
${input}

**Matches:**
${matches.join("\n")}
                `)
            );
        } else {
            const success = patternRegex.test(input);
            return message.send(new MessageEmbed()
                .setTitle(success ? "Success" : "Fail")
                .setDescription(`The pattern ${success ? "successfully matched" : "failed to match"} the input.`)
                .setColor(success ? 0x00FF00 : 0xFF0000)
            );
        }
    }

}

module.exports = Regex;