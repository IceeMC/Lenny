const Command = require("../../framework/Command.js");
const { MessageEmbed } = require("discord.js");

class GetError extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ["errinfo", "errorinfo", "viewerror"],
			description: "Gets detailed information about an error.",
			noHelp: true,
			check: 10,
			usage: "<errCode:string>"
		});
	}

    async run(message, [errCode]) {
        if (!errCode) throw "Please provide an error code.";
        const error = await this.client.db.getError(errCode);
        if (!error) throw "Invalid error errCode provided.";
        const embed = new MessageEmbed();
        embed.setAuthor(`Error ${errCode}`, message.author.displayAvatarURL({ size: 2048 }));
        embed.addField("Command:",`
Name: \`${error.command.name}\`
Description: \`${error.command.description}\`
Args: \`${error.command.args.length ? error.command.args.join(" ") : "No arguments provided"}\`
Flags: \`${Object.entries(error.command.flags).length ? Object.entries(error.command.flags).map(f => `--${f[0]}=${f[1]}`).join(", ") : "No flags provided."}\``, true);
        embed.addField("Guild", `\`${error.guild ? error.guild.name : "None (DM)"} (${error.guild.id})\``, true);
        embed.addField("Member", error.member ? `
Nickname: \`${error.member.nickname}\`
Display Name: \`${error.member.displayName}\`
Roles: \`${error.member.roles.length}\`` : "None (DM)", true);
        embed.addField("Author", `
Username: \`${error.author.username}\`
ID: \`${error.author.id}\`
Discriminator: \`${error.author.discriminator}\`
Tag: \`${error.author.tag}\``, true);
        embed.addField("Stack", this.client.utils.codeBlock(error.stack.length > 2045 ? `${error.stack.slice(0, 2045)}...` : error.stack, "js"));
        embed.setColor(this.client.utils.color);
        message.send(embed);
    }

};

module.exports = GetError;