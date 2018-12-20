const Event = require("../framework/Event.js");
const { MessageEmbed } = require("discord.js");
const { errorsChannel } = require("../utils/Constants.js");

class Error extends Event {

    async run(error) {
        const embed = new MessageEmbed()
            .setColor(this.client.utils.color)
            .setTitle("An error occurred")
            .setDescription(this.client.utils.codeBlock(error.stack ? error.stack : error, "js"));
        return this.client.channels.get(errorsChannel).send({ embed });
    }

}

module.exports = Error;