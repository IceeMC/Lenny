const Event = require("../framework/Event.js");
const { MessageEmbed } = require("discord.js");
const { joinsChannel } = require("../utils/Constants.js");
const { stripIndents } = require("common-tags");

class GuildCreateEvent extends Event {

    async run(guild) {
        const embed = new MessageEmbed()
            .setColor(0x00FF00)
            .setTitle("I've joined a server!")
            .setDescription(`\`${guild.name} (${guild.id})\``)
            .addField("Server owner:", guild.owner.user.tag)
            .addField("Member count:", guild.members.size);
        const serverLogs = this.client.channels.get(joinsChannel);
        await serverLogs.send(embed);
        await this.client.user.setActivity(`@Chat Noir help | ${this.client.guilds.size} servers!`);
        const chan = guild.channels.filter(c => c.type === "text" && c.postable).first();
        if (!chan) return;
        const joinMsg = [
            `Thanks for inviting me ${this.client.emojis.get("525145300017610753")}!`,
            `To view a list of commands run: \`${guild.config.prefix}help\``,
            "",
            stripIndents`Notice:
            Level are disabled by default (to prevent spam), with that said, you can enable level ups messages by running:
            \`${guild.config.prefix} levels enable\`
            `,
            "",
            `Have a great day! And hey, if you want to join the support server run: \`${guild.config.prefix} invite\``
        ].join("\n");
        await chan.send(joinMsg);
    }

}

module.exports = GuildCreateEvent;