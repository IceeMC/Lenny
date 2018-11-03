const { Event, util: { codeBlock } } = require("klasa");
const { MessageEmbed } = require("discord.js");
const { errorsChannel } = require("../utils/Constants.js");

class CommandError extends Event {

    async run(message, command, _, error) {
        if (error instanceof Error) this.client.console.wtf(`[CMD] ${error.stack || error}`);
        if (typeof error === "string") return message.send(error).catch(e => this.client.console.wtf(`[CMD] ${e.stack || e}`));
        message.send(this.errorFormat(error)).catch(e => this.client.console.wtf(`[CMD] ${e.stack || e}`));
        const embed = new MessageEmbed()
            .setColor(this.client.utils.color)
            .setDescription(`A error occurred in command ${command.name}\n${codeBlock("js", error.stack || error)}`)
            .setFooter(`This error was produced in ${message.guild ? message.guild.name : "a DM"} by ${message.author.tag}`);
        return this.client.channels.get(errorsChannel).send({ embed });
    }

    errorFormat(error) {
        return `
An error occurred:
${codeBlock("js", error.stack || error)}

You should not be getting an error like this **ever**.
Please join the support server and report it to one of the Admins:
https://discord.gg/mDkMbEh
        `;
    }

}

module.exports = CommandError;