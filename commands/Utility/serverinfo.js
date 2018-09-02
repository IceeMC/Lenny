const { Command } = require("klasa");
const { MessageEmbed } = require("discord.js");

class ServerInfo extends Command {

    constructor(...args) {
        super(...args, {
            name: "serverinfo",
            runIn: ["text"],
            description: language => language.get("COMMAND_SERVERINFO_DESCRIPTION"),
            aliases: ["si", "sinfo"],
            extendedHelp: "No extended help available."
        });
    }

    async run(message) {
        const embed = new MessageEmbed();
        embed.setColor(this.client.utils.color);
        embed.setTitle(message.guild.name);
        embed.setDescription("Server info");
        embed.setThumbnail(message.guild.iconURL());
        embed.addField("ID", message.guild.id, true);
        embed.addField(`Members`, message.guild.members.size, true);
        const verificationLevels = {
            0: "**None:** Unrestricted.",
            1: "**Low:** Must have a verified email on their Discord account.",
            2: "**Medium:** Must be registered on Discord for longer than 5 minutes.",
            3: "**(╯°□°）╯︵ ┻━┻:** Must be a member of this server for longer than 10 minutes.",
            4: "**(ノಠ益ಠ)ノ彡┻━┻:** Must have a verified phone on their Discord account."
        }
        //const verificationLevels = {
        //    0: "**None** No Security measures have been taken.",
        //    1: "**Low** Light Security measures have been taken. (Verified Email)",
        //    2: "**Moderate** Moderate Security measures have been taken. (Registered on Discord for longer than 5 minutes)",
        //    3: "**High** High Security measures have been taken. (Member of server for longer than 10 minutes)",
        //    4: "**Fort Knox** Almost impenetrable Security measures have been taken. (Verified Phone)"
        //}
        const contentFilters = {
            0: "**None** No Scanning enabled. (Don't scan any messages.)",
            1: "**Moderate** Moderate Scanning enabled. (Scan messages from members without a role.)",
            2: "**High** High Scanning enabled. (Scans every message.)"
        }
        if (message.guild.owner.user) embed.addField("Owner", `${message.guild.owner.user.tag} (${message.guild.owner.id})`);
        embed.addField("Roles", message.guild.roles.size, true);
        embed.addField("Channels", message.guild.channels.size, true);
        embed.addField("Content Filter", contentFilters[message.guild.explicitContentFilter], true)
        embed.addField("Verification Level", verificationLevels[message.guild.verificationLevel], true);
        let bans = null;
        try { bans = (await message.guild.fetchBans()).size; } catch (_) { bans = "Could not fetch bans."; }
        embed.addField("Bans", bans, true);
        return message.sendEmbed(embed);
    }

}

module.exports = ServerInfo;