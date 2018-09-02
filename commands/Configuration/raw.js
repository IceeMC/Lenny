const { Command } = require("klasa");
const { inspect } = require("util");

class Raw extends Command {

    constructor(...args) {
        super(...args, {
            name: "raw",
            description: language => language.get("COMMAND_RAW_DESCRIPTION"),
            runIn: ["text"],
            aliases: ["rawconf", "rawconfig"]
        });
    }

    async run(message) {
        const configString = JSON.stringify(message.guild.settings.toJSON(), null, 4);
        if (configString.length > 1999) return this.client.utils.haste(configString).then(link => message.send(link));
        return message.sendCode("json", configString);
    }

}

module.exports = Raw;