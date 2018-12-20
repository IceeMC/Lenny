const Command = require("../../framework/Command.js");
const exec = require("util").promisify(require("child_process").exec);

class Execute extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ["execute"],
			description: "Executes terminal commands.",
			noHelp: true,
			check: 10,
			usage: "<cmd:string::all>"
		});
	}

	async run(message, [cmd]) {
		const result = await exec(cmd, { timeout: "timeout" in message.flags ? Number(message.flags.timeout) : 15000 })
			.catch(error => ({ stdout: null, stderr: error }));
		const output = result.stdout ? `**\`OUTPUT\`**${this.client.utils.codeBlock(result.stdout, "prolog")}` : "";
		const err = result.stderr ? `**\`ERROR\`**${this.client.utils.codeBlock(result.stderr, "prolog")}` : "";

		return message.send([output, err].join("\n"));
	}

};

module.exports = Execute;