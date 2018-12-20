const Command = require("../../framework/Command.js");

class MakeError extends Command {

	constructor(...args) {
		super(...args, {
            aliases: ["makeafuckingerror"],
			description: "Makes an intentional error.",
			noHelp: true,
			check: 10
		});
	}

	async run() {
        return (await require("snekfetch").get("https://invalid.domian")).body;
	}

};

module.exports = MakeError;