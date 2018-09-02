const { Event } = require("klasa");
const { MessageEmbed } = require("discord.js");

class LogsEvent extends Event {

    async run(guild, logData) {
        const { settings } = guild;
        if (!settings.logs.channel) return;
        const logChannel = guild.channels.get(settings.logs.channel);
        if (!logChannel.postable) return;
        switch (logData.type) {
            // Roles
            case "memberRoleAdd": {
                logChannel.send(this.embed({
                    user: logData.member.user,
                    action: "Roles",
                    text: `${logData.member.user.username} has been given the ${logData.roles.size > 1 ? `roles ${logData.roles.map(r => `\`${r.name}\``).join(", ")}`: `role \`${logData.roles.first().name}\``}`,
                }));
                break;
            }
            case "memberRoleRemove": {
                logChannel.send(this.embed({
                    user: logData.member.user,
                    action: "Roles",
                    text: `${logData.member.user.username} has been removed from the ${logData.roles.size > 1 ? `roles ${logData.roles.map(r => `\`${r.name}\``).join(", ")}`: `role \`${logData.roles.first().name}\``}`,
                }));
                break;
            }
            case "roleAdd": {
                logChannel.send(this.embed({
                    action: "Roles",
                    text: `A new role was created:\n\nName: ${logData.role.name}\nID: ${logData.role.id}`,
                }));
                break;
            }
            case "roleRemove": {
                logChannel.send(this.embed({
                    action: "Roles",
                    text: `A role was removed:\n\nName: ${logData.role.name}\nID: ${logData.role.id}`,
                }));
                break;
            }
            // Nickname
            case "nicknameChange": {
                logChannel.send(this.embed({
                    action: "Nicknames",
                    text: `${logData.member.user.username} changed their nickname from \`${logData.oldNick}\` to \`${logData.newNick}\``
                }));
                break;
            }
            // Bans
            case "memberBan": {
                logChannel.send(this.embed({
                    action: "Ban",
                    text: `${logData.user.username} has been banned with reason: ${logData.reason}`
                }));
                break;
            }
            case "memberUnban": {
                logChannel.send(this.embed({
                    action: "Unban",
                    text: `${logData.user.username} has been unbanned`,
                    thumbnail: {
                        image: logData.user.displayAvatarURL({ size: 2048 }),
                        type: "user"
                    }
                }));
                break;
            }
            default: {
                this.client.console.warn(`Unhandled mod log event: ${logData.type}`);
            }
        }
    }

    embed(data = {}) {
        const embed = new MessageEmbed()
            .setColor(this.client.utils.color)
            .addField(data.action, data.text)
            .setTimestamp()
            .setFooter("RemixBot logs");
        if (data.user) embed.setAuthor(data.user.username, data.user.displayAvatarURL({ size: 2048 }));
        if (data.thumbnail && data.thumbnail.type === "user") embed.setThumbnail(data.thumbnail.image);
        return embed;
    }

}

module.exports = LogsEvent;