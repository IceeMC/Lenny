const { Command, util: { codeBlock } } = require("klasa");
const { MessageEmbed } = require("discord.js");
const MDNDocs = require("../../utils/MDNDocs.js");

class MDNDocsCommand extends Command {

    constructor(...args) {
        super(...args, {
            name: "mdn",
	        runIn: ["text"],
            description: language => language.get("COMMAND_MDN_DESCRIPTION"),
            aliases: ["jsdocs", "mdndocs"],
            usage: "<query:string>"
	    });
    }

    async run(message, [query]) {
        const embed = new MessageEmbed();
        embed.setTitle("Mozilla Docs");
        embed.setColor(this.client.utils.color);
        const result = await MDNDocs.search(query);
        if (!result) throw `**${query}** does not exist in the docs!`;
        const res = await MDNDocs.load(result);
        embed.setDescription(`**[${res.name}](${res.url})**\n\n${res.description}`);
        const params = res.params ? res.params.map(p => `${p[0]} - ${p[1]}`).join("\n") : null;
        const methods = res.methods ? res.methods.map(m => `${m[0]} - ${m[1]}`).join("\n") : null;
        if (res.syntax) embed.addField("Syntax:", codeBlock("js", res.syntax));
        if (params) embed.addField("Parameters:", params.length > 1021 ? `${params.slice(0, 1017)}\n\`...\`` : params);
        if (methods) embed.addField("Methods:", methods.length > 1021 ? `${methods.slice(0, 1017)}\n\`...\`` : methods);
        if (res.returnValue) embed.addField("Return Value:", res.returnValue);
        return message.send({ embed });
    }

};

module.exports = MDNDocsCommand;