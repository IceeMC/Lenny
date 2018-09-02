const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: language => language.get('COMMAND_PING_DESCRIPTION')
		});
	}

	async run(message) {
		const msg = await message.sendEmbed(message.language.get('COMMAND_PING'));
		return message.sendEmbed(message.language.get('COMMAND_PINGPONG',
			(msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp),
			Math.round(this.client.ping)
		));
	}

};
