const Event = require("../framework/Event.js");
const { MessageEmbed } = require("discord.js");
const { joinsChannel } = require("../utils/Constants.js");

class GuildDeleteEvent extends Event {

    async run(guild) {
        const embed = new MessageEmbed()
            .setColor(0xFF0000)
            .setTitle("I've left a server!")
            .setDescription(`\`${guild.name} (${guild.id})\``)
            .addField("Server owner:", guild.owner.user.tag)
            .addField("Member count:", guild.members.size);
        await this.client.user.setActivity(`@Chat Noir help | ${this.client.guilds.size} servers!`);
        const serverLogs = this.client.channels.get(joinsChannel);
        await serverLogs.send(embed);
    }

}

module.exports = GuildDeleteEvent;