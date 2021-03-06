const Command = require("../../framework/Command.js");

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ["text"],
			description: language => language.get("COMMAND_INVITE_DESCRIPTION")
		});
	}

	async run(message) {
		return message.sendLocale("COMMAND_INVITE", [this.client]);
	}

};
