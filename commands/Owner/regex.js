const { Command } = require("klasa");
const { MessageEmbed }  = require("discord.js");
const inputRegex = /\/(.*)\/([gimuy]+)?\s+(.*)/;

class Regex extends Command {

    constructor(...args) {
        super(...args, {
            name: "regex",
            guarded: true,
            permissionLevel: 10,
            aliases: ["rgx", "regexp"],
            runIn: ["text"],
            description: "Tests regular expressions with the provided search string.",
            usage: "<input:string>",
        });
    }

    async run(message, [input]) {
        const inputRegexExec = inputRegex.exec(input);
        if (!inputRegexExec) throw "Invalid input passed!";
        const pattern = inputRegexExec[1];
        const flags = inputRegexExec[2];
        const searchString = inputRegexExec[3];
        if (!pattern || !searchString) throw "No pattern or search string was supplied.";
        const patternRegex = new RegExp(pattern.trim(), flags);
        const patternExec = patternRegex.exec(searchString.trim());
        if (!patternExec) return message.send(new MessageEmbed()
            .setTitle("Error")
            .setDescription("No matches found.")
            .setColor(0xFF0000)
        );
        const matches = patternExec.map((m, i) => `**${i+1}** - ${Array.isArray(m) ? m.join(", ") : m}`);
        return message.send(new MessageEmbed()
            .setTitle("Success")
            .setColor(this.client.utils.color)
            .setDescription(`
**Pattern:**
\`/${pattern}/${flags || ""}\`

**Input:**
${searchString}

**Matches:**
${matches.join("\n")}
            `)
        );
    }

}

module.exports = Regex;