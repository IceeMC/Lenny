const Command = require("../../framework/Command.js");

class Raw extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_RAW_DESCRIPTION"),
            aliases: ["rawconf", "rawconfig"],
            runIn: ["text"]
        });
    }

    async run(message) {
        const configString = JSON.stringify(message.guild.config, null, 4);
        if (configString.length > 1999) return this.client.utils.haste(configString).then(link => message.send(link));
        return message.send(this.client.utils.codeBlock(configString, "json"));
    }

}

module.exports = Raw;