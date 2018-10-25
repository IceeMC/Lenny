const { Command, util: { exec, codeBlock } } = require("klasa");

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ["pull", "gitpull"],
			description: "Pulls from the GitHub repo.",
			guarded: true,
			permissionLevel: 10
		});
	}

	async run(msg) {
		const result = await exec("git pull", { timeout: "timeout" in msg.flags ? Number(msg.flags.timeout) : 60000 })
			.catch(error => ({ stdout: null, stderr: error }));
		const output = result.stdout ? `**\`OUTPUT\`**${codeBlock("prolog", result.stdout)}` : "";
		const outerr = result.stderr ? `**\`ERROR\`**${codeBlock("prolog", result.stderr)}` : "";

		return msg.sendMessage([output, outerr].join("\n"));
	}

};