const Event = require("../framework/Event.js");

module.exports = class extends Event {

	async run(messages) {
		if (!messages.first().guild.config.logs.messages) return;
		const first = messages.first();
		const guild = this.client.guilds.get(first.guild.id);
		this.client.emit("logs", guild, {
			type: "bulkDelete",
			count: messages.size,
			channel: first.channel
		});
		for (const message of messages) if (message.reply) await message.reply.delete().catch(() => null);
	}

};
