const Command = require("../../framework/Command.js");
const ArgResolver = require("../../framework/ArgResolver.js"); 

class LevelUps extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: language => language.get("COMMAND_LEVELUPS_DESCRIPTION"),
            subCommands: ["enable", "disable"],
            usage: "<type>",
            check: 7
        });
    }

    async run(message, [type]) {
        if (type === "enable") return this.enableLevelUps(message);
        if (type === "disable") return this.disableLevelUps(message);
    }

    async enableLevelUps(message) {
        await message.guild.updateConfig({ levelsEnabled: true });
        return message.sendLocale("COMMAND_LEVELUPS_ENABLED");
    }

    async disableLevelUps(message) {
        await message.guild.updateConfig({ levelsEnabled: false });
        return message.sendLocale("COMMAND_LEVELUPS_DISABLED");
    }

}

module.exports = LevelUps;