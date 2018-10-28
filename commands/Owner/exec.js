const { Command, util: { exec, codeBlock } } = require("klasa");

class Execute extends Command {

	constructor(...args) {
		super(...args, {
			name: "exec",
			aliases: ["execute"],
			description: "Executes terminal commands.",
			usage: "<cmd:string>",
			guarded: true,
			permissionLevel: 10
		});
	}

	async run(msg, [cmd]) {
		const result = await exec(cmd, { timeout: "timeout" in msg.flags ? Number(msg.flags.timeout) : 60000 })
			.catch(error => ({ stdout: null, stderr: error }));
		const output = result.stdout ? `**\`OUTPUT\`**${codeBlock("prolog", result.stdout)}` : "";
		const outerr = result.stderr ? `**\`ERROR\`**${codeBlock("prolog", result.stderr)}` : "";

		return msg.sendMessage([output, outerr].join("\n"));
	}

};

module.exports = Execute;