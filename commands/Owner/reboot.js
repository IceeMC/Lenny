const { Command } = require('klasa');

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
		await this.client.settings.update({
			latestRestart: {
				channel: m.channel.id,
				messageId: m.id
			}
		});
	}

};
