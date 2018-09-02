const { Event } = require('klasa');

module.exports = class extends Event {

	run(messages) {
		const first = messages.first();
		const guild = this.client.guilds.get(first.guild.id);
		this.client.emit("logs", guild, {
			type: "bulkDelete",
			count: messages.size,
			channel: first.channel
		});
		for (const message of messages) if (message.command && message.command.deletable) for (const msg of message.responses) msg.delete();
	}

};
