const Command = require("../../framework/Command.js")

function validate(message, arg) {
    if (!arg) throw message.language.get("SUB_COMMAND_INVALID", ["bot", "me", "member"]);
    if (arg === "bot") return message.guild.me;
    if (arg === "me") return message.member;
    return message.client.storeManager.getStore("args").files.get("member").run(message, arg);
}

class Nick extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_NICK_DESCRIPTION"),
            extendedHelp: language => language.get("COMMAND_NICK_EXTENDED_HELP"),
            runIn: ["text"],
            usage: "[member:string] <nick:string::all>",
            perms: ["MANAGE_NICKNAMES"],
            check: 6,
            cooldown: 10,
            aliases: ["setnick", "modifynick", "changenick", "snick", "mnick", "cnick"]
        });
    }

    async run(message, [member, nick]) {
        member = validate(message, member);
        if (nick.length >= 32) throw message.language.get("COMMAND_NICK_LIMIT");
        if (member.roles.highest.position >= message.guild.me.roles.highest.position) throw message.language.get("ROLE_HIERARCHY");
        await member.edit({ nick });
        return message.sendLocale("COMMAND_NICK_SUCCESS", [message, member, this.client.clean(message, nick)]);
    }

}

module.exports = Nick;