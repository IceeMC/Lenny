const { Command } = require("klasa");

class Prefix extends Command {
    
    constructor(...args) {
        super(...args, {
            name: "prefix",
            runIn: ["text"],
            description: language => language.get('COMMAND_PREFIX_DESCRIPTION'),
            usage: '<newPrefix:string>',
            permissionLevel: 7,
        });
    }


    async run(message, [newPrefix]) {
        if (newPrefix === "reset" || newPrefix === "default") {
            this._update(message.guild, "r.");
            message.sendLocale("COMMAND_PREFIX", ["r."]);
        } else {
            this._update(message.guild, newPrefix);
            message.sendLocale("COMMAND_PREFIX", [newPrefix]);
        }
    }

    _update(guild, newPrefix) {
        guild.settings.update([["prefix", newPrefix]]);
    }

}

module.exports = Prefix;