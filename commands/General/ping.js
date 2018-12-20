const Command = require("../../framework/Command.js");

class Ping extends Command {

	constructor(...args) {
		super(...args, {
			description: language => language.get("COMMAND_PING_DESCRIPTION")
		});
	}

	async run(message) {
		const msg = await message.send(message.language.get("COMMAND_PING"));
		return message.send(message.language.get("COMMAND_PINGPONG",
			(msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp),
			Math.round(this.client.ws.ping)
		));
	}

};

module.exports = Ping;