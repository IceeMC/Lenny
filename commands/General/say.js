const Command = require("../../framework/Command.js");

class Say extends Command {

	constructor(...args) {
		super(...args, {
            description: language => language.get("COMMAND_SAY_DESCRIPTION"),
            aliases: ["botsay", "saysomething"],
            usage: "<text:string::all>"
		});
	}

	async run(message, [text]) {
		return message.channel.send(this.client.clean(message, text));
	}

};

module.exports = Say;