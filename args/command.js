const Arg = require("../framework/commandUsage/Arg.js");

class CommandArg extends Arg {

    constructor(...args) {
        super(...args, { aliases: ["str"] });
    }

    run(_, arg) {
        const commands = this.client.storeManager.getStore("commands");
        const aliases = commands.aliases;
        const cmd = commands.files.get(arg) || aliases.get(arg);
        if (cmd) return cmd;
        throw `Command: \`${arg}\` was not found!`;
    }

}

module.exports = CommandArg;