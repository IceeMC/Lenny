const { Command, Timestamp } = require("klasa");
const { MessageEmbed } = require("discord.js");

class UserInfo extends Command {

    constructor(...args) {
        super(...args, {
            name: "userinfo",
            runIn: ["text"],
            description: language => language.get("COMMAND_USERINFO_DESCRIPTION"),
            aliases: ["ui", "useri"],
            usage: "[member:member]",
            extendedHelp: "No extended help available."
        });
        this.statuses = {
            online: "<:online:485644047709634580> -> Online",
            idle: "<:idle:485644073353609217> -> Idle",
            dnd: "<:dnd:485644095105269762> -> Do Not Disturb",
            offline: "<:offline:485644354149416964> -> Offline",
            streaming: "<:streaming:485647466914381826> -> Streaming"
        }
    }

    async run(message, [member]) {
        if (!member) member = message.member;
        const embed = new MessageEmbed();
        const ts = new Timestamp("MM/DD/YYYY");
        embed.setTitle("User info");
        embed.setAuthor(member.nickname ? member.nickname : member.user.tag, member.user.displayAvatarURL());
        embed.setColor(member.roles.highest.color);
        embed.setThumbnail(member.user.displayAvatarURL());
        embed.addField("-> ID", member.user.id, true);
        embed.addField("-> Join Position", message.guild.members.array().sort((a, b) => a.joinedAt > b.joinedAt ? 1 : -1).indexOf(member), true);
        embed.addField("-> Account type", member.user.bot ? ":robot: Bot" : ":bust_in_silhouette: User", true);
        embed.addField("-> Created", ts.display(member.user.createdAt), true);
        embed.addField("-> Joined guild", ts.display(member.joinedAt), true);
        embed.addField("-> Highest role", member.roles.highest.name, true);
        embed.addField("-> Role count", member.roles.size, true);
        const roles = member.roles.filter(r => r.name !== "@everyone").array().sort((a, b) => a.position < b.position ? 1 : -1).join(", ");
        embed.addField("-> Roles", roles, true);
        embed.addField("-> Status", this.isStreaming(member) ? this.statuses.streaming : this.statuses[member.presence.status], true);
        if (member.presence.activity) embed.addField("-> Presence", `${this.presenceType(member.presence.activity.type)} **${member.presence.activity.name}**`, true);
        return message.sendEmbed(embed);
    }

    isStreaming(member) {
        return member.presence.activity ? member.presence.activity.type === "STREAMING" : false;
    }

    presenceType(type) {
        return type === "PLAYING" ? "Playing" : type === "STREAMING" ? "Streaming" : type === "LISTENING" ? "Listening" : "Watching";
    }

}

module.exports = UserInfo;