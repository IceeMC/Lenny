const Event = require("../framework/Event.js");
const { MessageEmbed } = require("discord.js");
const { errorsChannel } = require("../utils/Constants.js");

class CmdError extends Event {

    async run(message, command, error) {
        if (error instanceof Error) this.client.console.wtf(`[CMD] ${error.stack || error}`);
        if (typeof error === "string") return message.send(error).catch(e => this.client.console.wtf(`[CMD] ${e.stack || e}`));
    }

}

module.exports = CmdError;
