const Event = require("../framework/Event.js");
const { MessageEmbed } = require("discord.js");

class LogsEvent extends Event {

    async run(guild, logData) {
        const { config } = guild;
        if (!config.logs.channel) return;
        const logChannel = guild.channels.get(config.logs.channel);
        if (!logChannel || !logChannel.postable) return;
        switch (logData.type) {
            // Guild
            case "guildUpdate": {
                logChannel.send(this.embed({
                    action: "Guild Update",
                    text: `Updates:\n\n${logData.updates.map(update => `**${update.text}:**\nBefore: ${update.old}\nAfter: ${update.new}`) || "(No updates)"}`
                }));
                break;
            }
            // Channels
            case "channelAdd": {
                logChannel.send(this.embed({
                    action: "Channel Added",
                    text: `Channel: \`${logData.channel.name}\`\nID: ${logData.channel.id}`
                }));
                break;
            }
            case "channelUpdate": {
                logChannel.send(this.embed({
                    action: "Channel Updated",
                    text: `Updates:\n\n${logData.updates.map(update => `**${update.text}:**\nBefore: ${update.old}\nAfter: ${update.new}`) || "(No updates)"}`
                }));
                break;
            }
            case "channelRemove": {
                logChannel.send(this.embed({
                    action: "Channel Removed",
                    text: `Channel: \`${logData.channel.name}\`\nID: ${logData.channel.id}`
                }));
                break;
            }
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
                    user: logData.member.user,
                    text: `A new role was created:\n\nName: ${logData.role.name}\nID: ${logData.role.id}`,
                }));
                break;
            }
            case "roleRemove": {
                logChannel.send(this.embed({
                    action: "Roles",
                    user: logData.member.user,
                    text: `A role was removed:\n\nName: ${logData.role.name}\nID: ${logData.role.id}`,
                }));
                break;
            }
            // Nickname
            case "nicknameChange": {
                logChannel.send(this.embed({
                    action: "Nicknames",
                    user: logData.member.user,
                    text: `${logData.member.user.username} changed their nickname from \`${logData.oldNick}\` to \`${logData.newNick}\``
                }));
                break;
            }
            // Bans
            case "memberBan": {
                logChannel.send(this.embed({
                    action: "Ban",
                    text: `${logData.user.username} has been banned with reason: ${logData.reason}`,
                    user: logData.user,
                    thumbnail: logData.user.displayAvatarURL({ size: 2048 })
                }));
                break;
            }
            case "memberUnban": {
                logChannel.send(this.embed({
                    action: "Unban",
                    text: `${logData.user.username} has been unbanned`,
                    user: logData.user,
                    thumbnail: logData.user.displayAvatarURL({ size: 2048 })
                }));
                break;
            }
            // Joins/Leaves
            case "memberJoin": {
                logChannel.send(this.embed({
                    action: "Member Join",
                    text: `**${logData.member.user.tag}** has joined the server!`,
                    user: logData.member.user,
                    thumbnail: logData.member.username
                }));
                break;
            }
            case "memberLeave": {
                logChannel.send(this.embed({
                    action: "Member Left",
                    text: `**${logData.member.user.tag}** has left the server!`,
                    user: logData.member.user,
                    thumbnail: logData.member.username
                }));
                break;
            }
            // Warns
            case "memberWarn": {
                logChannel.send(this.embed({
                    action: "Member Warned",
                    text: `**${logData.member.user.tag}** has been warned for ${logData.reason}`,
                    user: logData.member.user,
                    thumbnail: logData.member.username
                }));
                break;
            }
            // Messages
            case "bulkDelete": {
                logChannel.send(this.embed({
                    action: "Bulk message deletion",
                    text: `${logData.count} messages were deleted in channel: ${logData.channel}`
                }));
                break;
            }
            case "messageDelete": {
                logChannel.send(this.embed({
                    action: "Message Deleted",
                    text: `Message by ${logData.message.member.user} was deleted in channel ${logData.message.channel}\`Message Content:\` ${logData.message.content || "(This message has no content)"}`,
                    user: logData.message.member.user,
                    thumbnail: logData.message.member.user.displayAvatarURL({ size: 2048 })
                }));
                break;
            }
            case "messageUpdate": {
                logChannel.send(this.embed({
                    action: "Message Updated",
                    text: `Old Content: ${logData.oldContent || "(This message has no content)"}\nNew Content: ${logData.newContent || "(This message has no content)"}`,
                    user: logData.member.user,
                    thumbnail: logData.member.user.displayAvatarURL({ size: 2048 })
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
            .setFooter("Chat Noir mod logs");
        if (data.user) embed.setAuthor(data.user.username, data.user.displayAvatarURL({ size: 2048 }));
        if (data.thumbnail) embed.setThumbnail(data.thumbnail.image);
        return embed;
    }

}

module.exports = LogsEvent;