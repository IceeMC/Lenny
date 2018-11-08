const { Command, util: { toTitleCase } } = require("klasa");
const { Permissions, MessageEmbed } = require("discord.js");

class RoleInfo extends Command {

    constructor(...args) {
        super(...args, {
            name: "roleinfo",
            aliases: ["rinfo"],
            runIn: ["text"],
            description: language => language.get('COMMAND_ROLEINFO_DESCRIPTION'),
            usage: "<role:rolename>"
        });
    }

    async run(message, [role]) {
        const allowed = this.allowedPerms(role);
        const denied = this.deniedPerms(role);
        const embed = new MessageEmbed();
        embed.setColor(role.color);
        embed.setTitle(role.name);
        embed.addField("-> Allowed Permissions", allowed.length > 0 ? allowed.map(perm => this.toTitleCase(perm)).join(", ") : "No permissions are allowed for this role.");
        embed.addField("-> Denied Permissions", denied.length > 0 ? denied.map(perm => this.toTitleCase(perm)).join(", ") : "No permissions for this role are denied.");
        return message.send(embed);
    }

    allowedPerms(role) {
        const allowed = [];
        for (const [name, flag] of Object.entries(Permissions.FLAGS)) {
            if (role.permissions.has(flag)) allowed.push(name);
        }
        return allowed;
    }

    deniedPerms(role) {
        const denied = [];
        for (const [name, flag] of Object.entries(Permissions.FLAGS)) {
            if (!role.permissions.has(flag)) denied.push(name);
        }
        return denied;
    }

    toTitleCase(text) {
        return text.split("_").map(toTitleCase).join(" ");
    }

}

module.exports = RoleInfo;