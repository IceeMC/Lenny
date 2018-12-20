const Command = require("../../framework/Command.js");
const exec = require("util").promisify(require("child_process").exec);

class Pull extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ["gitpull", "update"],
			description: "Updates the bot; then exits the process to restart.",
			noHelp: true,
			check: 10
		});
	}

	async run(message) {
		const result = await exec("git pull");
        await message.send(`Updated:\n${this.client.utils.codeBlock(result, "xl")}`);
        process.exit();
	}

};

module.exports = Pull;