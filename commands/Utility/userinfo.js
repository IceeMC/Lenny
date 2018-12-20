const Command = require("../../framework/Command.js");
const ArgResolver = require("../../framework/ArgResolver.js");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

class UserInfo extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: language => language.get("COMMAND_USERINFO_DESCRIPTION"),
            usage: "[member:member::all]",
            aliases: ["ui", "useri"]
        });
        this.statuses = {
            online: "<:online:485644047709634580> (Online)",
            idle: "<:idle:485644073353609217> (Idle)",
            dnd: "<:dnd:485644095105269762> (Do Not Disturb)",
            offline: "<:offline:485644354149416964> (Offline)",
            streaming: "<:streaming:485647466914381826> (Streaming)"
        }
    }

    async run(message, [member]) {
        if (!member) member = message.member;
        const embed = new MessageEmbed();
        embed.setTitle("User info");
        embed.setAuthor(member.displayName, member.user.displayAvatarURL());
        embed.setColor(member.roles.highest.color);
        embed.setThumbnail(member.user.displayAvatarURL());
        embed.addField("ID", member.user.id, true);
        embed.addField("Join Position:", message.guild.members.array().sort((a, b) => a.joinedAt > b.joinedAt ? 1 : -1).indexOf(member) + 1, true);
        embed.addField("Account type:", member.user.bot ? ":robot: Bot" : ":bust_in_silhouette: User", true);
        embed.addField("Created:", moment(member.user.createdAt).format("MM/DD/YYYY hh:mm:ss"), true);
        embed.addField("Joined guild:", moment(member.joinedAt).format("MM/DD/YYYY hh:mm:ss"), true);
        embed.addField("Highest role:", member.roles.highest.name, true);
        embed.addField("Hoist role:", member.roles.hoist.name, true);
        embed.addField("Role count:", member.roles.size, true);
        let roles = member.roles.array();
        roles.splice(member.roles.array().indexOf(message.guild.roles.get(message.guild.id)));
        embed.addField("Roles:", roles.sort((a, b) => b.position > a.position ? 1 : -1).join(", "));
        embed.addField("Status:", this.isStreaming(member) ? this.statuses.streaming : this.statuses[member.presence.status], true);
        if (member.presence.activity) embed.addField("Presence:", `${this.presenceType(member.presence.activity.type)} **${member.presence.activity.name}**`, true);
        return message.send(embed);
    }

    isStreaming(member) {
        return member.presence.activity ? member.presence.activity.type === "STREAMING" : false;
    }

    presenceType(type) {
        return type === "PLAYING" ? "Playing" : type === "STREAMING" ? "Streaming" : type === "LISTENING" ? "Listening" : "Watching";
    }

}

module.exports = UserInfo;