const Command = require("../../framework/Command.js");
const { version: discordVersion } = require("discord.js");
const os = require("os");
const { readFileSync } = require("fs");

class Stats extends Command {

	constructor(...args) {
		super(...args, {
			description: language => language.get("COMMAND_STATS_DESCRIPTION")
		});
	}

	async run(message) {
		let [users, guilds, channels, memory] = [0, 0, 0, 0];

		if (this.client.shard) {
			const results = await this.client.shard.broadcastEval(`[this.users.size, this.guilds.size, this.channels.size, (process.memoryUsage().heapUsed / 1024 / 1024)]`);
			for (const result of results) {
				users += result[0];
				guilds += result[1];
				channels += result[2];
				memory += result[3];
			}
		}

		return message.send(message.language.get("COMMAND_STATS",
			(memory || process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			this.client.utils.formatMS(process.uptime()),
			(users || this.client.users.size).toLocaleString(),
			(guilds || this.client.guilds.size).toLocaleString(),
			(channels || this.client.channels.size).toLocaleString(),
			discordVersion, process.version, message,
			Array.from(this.client.audioManager.values()).filter(p => !p.idle).length,
			(os.totalmem() / 1073741824).toFixed(2),
			((os.totalmem() - os.freemem()) / 1073741824).toFixed(2),
			((os.totalmem() / 1073741824) - ((os.totalmem() - os.freemem()) / 1073741824)).toFixed(2),
			this.client.utils.formatMS(os.uptime()),
			process.platform !== "win32" ?
				this.client.utils.formatMS(parseFloat(readFileSync("/proc/uptime", { encoding: "utf-8" }).split(" ")[0])) :
				this.client.utils.formatMS(os.uptime()),
			os.loadavg().map(avg => avg * 10000 / 1000).reduce((p, v) => p + v).toFixed(2),
		));
	}

};

module.exports = Stats;