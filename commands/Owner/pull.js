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
        const { stdout, stderr } = await exec("git pull").catch(err => ({ stdout: null, stderr: err }));
        const output = stdout ? `**\`Updated\`**${this.client.utils.codeBlock(stdout, "prolog")}` : "";
		const err = stderr ? `**\`Error while updating\`**${this.client.utils.codeBlock(stderr, "prolog")}` : "";
        await message.send([output, err].join("\n"));
        if (stdout.search(/up-to-date/) < -1) process.exit();
	}

};

module.exports = Pull;