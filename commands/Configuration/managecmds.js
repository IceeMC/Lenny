const Command = require("../../framework/Command.js");
const ArgResolver = require("../../framework/ArgResolver.js"); 

class ManageCmds extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: language => language.get("COMMAND_MANAGE_CMDS_DESCRIPTION"),
            subCommands: ["enable", "disable"],
            usage: "<type> <name:string>",
            check: 7
        });
    }

    async run(message, [type, name]) {
        if (!type) throw message.language.get("SUB_COMMAND_INVALID", ["enable", "disable"]);
        if (type === "enable") return this.enableCmd(message, name);
        if (type === "disable") return this.disableCmd(message, name);
        if (!type) throw message.language.get("SUB_COMMAND_INVALID", ["enable", "disable"]);
    }

    async enableCmd(message, name) {
        if (!name) throw "Please provide a command name.";
        const defaultCmds = [
            ...this.store.filter(c => c.category === "General").map(c => c.name),
            ...this.store.filter(c => c.category === "Owner").map(c => c.name),
            ...this.store.filter(c => c.category === "Configuration").map(c => c.name)
        ];
        const cmd = ArgResolver.command(message, name);
        if (defaultCmds.includes(cmd.name)) throw "Hey! That is a default command. So, you can't enable it.";
        const { commandsDisabled } = message.guild.config;
        if (!commandsDisabled.includes(cmd.name)) throw "That command is not currently enabled.";
        commandsDisabled.splice(commandsDisabled.indexOf(cmd.name), 1);
        await message.guild.updateConfig({ commandsDisabled });
        message.sendLocale("COMMAND_MANAGE_CMDS_ENABLED_CMD", [cmd]);
    }

    async disableCmd(message, name) {
        if (!name) throw "Please provide a command name.";
        const defaultCmds = [
            ...this.store.filter(c => c.category === "General").map(c => c.name),
            ...this.store.filter(c => c.category === "Owner").map(c => c.name),
            ...this.store.filter(c => c.category === "Configuration").map(c => c.name)
        ];
        const cmd = ArgResolver.command(message, name);
        if (defaultCmds.includes(cmd.name)) throw "Hey! That is a default command. So, you can't disable it.";
        const { commandsDisabled } = message.guild.config;
        if (commandsDisabled.includes(cmd.name)) throw "That command is currently disabled.";
        commandsDisabled.push(cmd.name);
        await message.guild.updateConfig({ commandsDisabled });
        message.sendLocale("COMMAND_MANAGE_CMDS_DISABLED_CMD", [cmd]);
    }

}

module.exports = ManageCmds;