const { Command } = require('klasa');
const { spawn } = require("child_process");

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 10,
			guarded: true,
			description: language => language.get('COMMAND_REBOOT_DESCRIPTION')
		});
	}

	async run(message) {
		const m = await message.sendLocale('COMMAND_REBOOT');
		await this.client.settings.update([
			["latestRestart.channel", m.channel.id],
			["latestRestart.message", m.id],
			["latestRestart.started", true]
		], m);
		spawn("node", ["."], { cwd: process.cwd() });
	}

};
