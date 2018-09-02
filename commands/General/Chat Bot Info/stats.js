const { Command, version: klasaVersion, Duration } = require('klasa');
const { version: discordVersion } = require('discord.js');
const os = require("os");

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: language => language.get('COMMAND_STATS_DESCRIPTION')
		});
	}

	
	uptime(ms) {
		let uptime = "";
		let seconds = Math.floor(ms);
		const days = Math.floor(seconds / (3600 * 24));
		seconds -= days * 3600 * 24;
		const hrs = Math.floor(seconds / 3600);
		seconds -= hrs * 3600;
		const minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;

		if (days > 0) {
			if (days > 1) {
				uptime += `${days} days, `;
			} else {
				uptime += `${days} day, `;
			}
		} else { uptime += ""; }

		if (hrs > 0) {
			if (hrs > 1) {
				uptime += `${hrs} hours, `;
			} else {
				uptime += `${hrs} hour, `;
			}
		} else { uptime += ""; }

		if (minutes > 0) {
			if (minutes > 1) {
				uptime += `${minutes} minutes, and `;
			} else {
				uptime += `${minutes} minute, and `;
			}
		} else { uptime += ""; }

		if (seconds > 1) {
			uptime += `${seconds} seconds`;
		} else {
			uptime += `${seconds} second`;
		}

		return uptime;
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

		return message.sendEmbed(message.language.get('COMMAND_STATS',
			(memory || process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			this.uptime(process.uptime()),
			(users || this.client.users.size).toLocaleString(),
			(guilds || this.client.guilds.size).toLocaleString(),
			(channels || this.client.channels.size).toLocaleString(),
			klasaVersion, discordVersion, process.version, message,
			Array.from(this.client.audioManager.values()).filter(p => !p.idle).length,
			(os.totalmem() / 1073741824).toFixed(2),
			((os.totalmem() - os.freemem()) / 1073741824).toFixed(2),
			((os.totalmem() / 1073741824) - ((os.totalmem() - os.freemem()) / 1073741824)).toFixed(2),
			this.uptime(os.uptime())
		));
	}

};
