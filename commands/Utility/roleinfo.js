const Command = require("../../framework/Command.js");
const { Permissions, MessageEmbed } = require("discord.js");
const titleCaseRgx = /[A-Za-z]*/;
const title = str => str.replace(titleCaseRgx, s => `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`);

class RoleInfo extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ["rinfo"],
            runIn: ["text"],
            description: language => language.get('COMMAND_ROLEINFO_DESCRIPTION'),
            usage: "<role:role::all>"
        });
    }

    async run(message, [role]) {
        const allowed = this.allowedPerms(role);
        const denied = this.deniedPerms(role);
        const embed = new MessageEmbed();
        embed.setColor(role.color);
        embed.setTitle(role.name);
        embed.addField("-> Allowed Permissions", allowed.length > 0 ? allowed.join(", ") : "No permissions for this role are allowed.");
        embed.addField("-> Denied Permissions", denied.length > 0 ? denied.join(", ") : "No permissions for this role are denied.");
        return message.send(embed);
    }

    allowedPerms(role) {
        const allowed = [];
        Object.entries(Permissions.FLAGS).map(([name, flag]) => role.permissions.has(flag) ? allowed.push(this.toTitleCase(name)) : null);
        return allowed;
    }

    deniedPerms(role) {
        const denied = [];
        Object.entries(Permissions.FLAGS).map(([name, flag]) => !role.permissions.has(flag) ? denied.push(this.toTitleCase(name)) : null);
        return denied;
    }

    toTitleCase(text) {
        return text.split("_").map(title).join(" ");
    }

}

module.exports = RoleInfo;