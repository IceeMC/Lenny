const Event = require("../framework/Event.js");
const { MessageEmbed } = require("discord.js");
const { errorsChannel } = require("../utils/Constants.js");

class CmdError extends Event {

    async run(message, command, error) {
        if (error instanceof Error) this.client.console.wtf(`[CMD] ${error.stack || error}`);
        if (typeof error === "string") return message.send(error).catch(e => this.client.console.wtf(`[CMD] ${e.stack || e}`));
        const errorCode = await this.client.db.createError(command, message, error.stack || error);	
        message.send(new MessageEmbed().setColor(this.client.utils.color).setDescription(`	
Sorry, but an unexpected error occurred while processing the command:	
${command.client.utils.codeBlock(error.stack ? error.stack : error, "js")}	
 Code: ${errorCode}	
 **This keeps happening. What can I do?**	
1. Join the [official server](https://discord.gg/mDkMbEh).	
2. Send the error code in #support. An Admin will respond to your request.`));	
        const embed = new MessageEmbed()	
            .setColor(this.client.utils.color)	
            .setDescription(`	
A error occurred with command ${command.name}:	
Code: ${errorCode}	
\n${command.client.utils.codeBlock(error.stack ? error.stack : error, "js")}`)	
            .setFooter(`Server: ${message.guild ? message.guild.name : "None (DM)"} | User: ${message.author.tag}`);	
        return this.client.channels.get(errorsChannel).send({ embed });
    }

}

module.exports = CmdError;
