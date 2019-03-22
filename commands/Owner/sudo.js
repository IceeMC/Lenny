const Command = require("../../framework/Command.js");
const { Util: { cloneObject } } = require("discord.js");

class Sudo extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: "Executes a command as if another user ran it with the optional [args] if any.",
            usage: "<member:member> <command:command> [args:string::all]",
            check: 10,
            noHelp: true
        });
    }

    async run(message, [member, cmd, args]) {
        const msg = cloneObject(message);
        Object.defineProperty(msg, "member", { value: member });
        Object.defineProperty(msg, "author", { value: member.user });
        // No need to check args just set the "new" message content
        msg.content = `${message.prefix}${cmd.name} ${args || ""}`;
        this.client.emit("message", msg);
    }

}

module.exports = Sudo;
