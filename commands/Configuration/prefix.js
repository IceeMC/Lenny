const Command = require("../../framework/Command.js");

class Prefix extends Command {
    
    constructor(...args) {
        super(...args, {
            name: "prefix",
            runIn: ["text"],
            description: language => language.get('COMMAND_PREFIX_DESCRIPTION'),
            usage: "[prefix:string[1,8]]",
            check: 7,
        });
    }


    async run(message, [prefix]) {
        if (!prefix) throw message.language.get("COMMAND_PREFIX_NULL");
        if (!prefix || prefix === "reset" || prefix === "default") {
            await message.guild.updateConfig({ prefix: "cn." })
            message.sendLocale("COMMAND_PREFIX", ["cn."]);
        } else {
            await message.guild.updateConfig({ prefix: this.client.clean(message, prefix) });
            message.sendLocale("COMMAND_PREFIX", [this.client.clean(message, prefix)]);
        }
    }

}

module.exports = Prefix;