const { Command, RichDisplay, util } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require("discord.js");

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['commands'],
			guarded: true,
			description: language => language.get('COMMAND_HELP_DESCRIPTION'),
			usage: '(command:command)'
		});
		this.createCustomResolver('command', (arg, possible, message) => {
			return !arg ? undefined : this.client.arguments.get('command').run(arg, possible, message);
		});
	}

	async run(message, [command]) {
		if (command) {
			const embed = new MessageEmbed()
				.setTitle(command.name)
				.setColor(this.client.utils.color)
				.setDescription(`\`${command.description(message.language) || command.description}\``)
				.addField("Usage", command.usage.fullUsage(message))
				.addField("Extended Help", util.codeBlock("xl", command.extendedHelp(message.language) || command.extendedHelp))
				.setTimestamp()
				.setFooter(`Help requested by ${message.author.tag}`);
			return message.send({ embed });
		}
		const help = await this.buildHelp(message);
		const categories = Object.keys(help);
		if (message.guild && message.guild.me.permissions.has(["MANAGE_MESSAGES", "ADD_REACTIONS"])) {
			const helpMenu = new RichDisplay(new MessageEmbed()
				.setColor(this.client.utils.color)
				.setAuthor("All Commands", message.author.displayAvatarURL({ format: "png" }))
				.setDescription("Use the buttons to switch between pages.")
			);
			for (let cat = 0; cat < categories.length; cat++) {
				const subCategories = Object.keys(help[categories[cat]]);
				let helpPageValue = "";
				for (let subCat = 0; subCat < subCategories.length; subCat++)
					helpPageValue += `${help[categories[cat]][subCategories[subCat]].map(c => c.nodm).join('\n')}\n`;
				helpMenu.addPage(t => t.addField(`${categories[cat]} Commands`, helpPageValue));
			}
			return helpMenu.run(await message.send("Loading..."), { filter: (_, user) => user.id === message.author.id });
		} else {
			let dmHelp = "";
			for (let cat = 0; cat < categories.length; cat++) {
				const subCategories = Object.keys(help[categories[cat]]);
				let helpPageValue = "\`\`\`ascii\n";
				for (let subCat = 0; subCat < subCategories.length; subCat++)
					helpPageValue += `${help[categories[cat]][subCategories[subCat]].map(c => c.dm).join('\n')}`;
				helpPageValue += "\`\`\`\u200b";
				dmHelp += `**${categories[cat]} Commands:**\n\n${helpPageValue}`;
			}
			return message.author.send(dmHelp, { split: { char: "\u200b" } })
				.then(() => { if (message.channel.type !== "dm") message.sendLocale("COMMAND_DM_SUCCESS") })
				.catch(async () => {
					if (message.channel.type !== "dm") message.channel.send(await this.buildHelp2(message), { split: { char: "\u200b" }}).catch(() => null);
				});
		}
	}

	async buildHelp2(message) {
		const help = await this.buildHelp(message);
		const categories = Object.keys(help);
		let helpStr = "";
		for (let cat = 0; cat < categories.length; cat++) {
			const subCategories = Object.keys(help[categories[cat]]);
			let helpPageValue = "\`\`\`ascii\n";
			for (let subCat = 0; subCat < subCategories.length; subCat++)
				helpPageValue += `${help[categories[cat]][subCategories[subCat]].map(c => c.dm).join('\n')}`;
			helpPageValue += "\`\`\`\u200b";
			helpStr += `**${categories[cat]} Commands:**\n\n${helpPageValue}`;
		}
		return helpStr;
	}

	async buildHelp(message) {
		const help = {};
		const { prefix } = message.guild.settings;
		const commandNames = [...this.client.commands.keys()];
		const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

		await Promise.all(this.client.commands.map((command) =>
			this.client.inhibitors.run(message, command, true)
				.then(() => {
					if (!help.hasOwnProperty(command.category)) help[command.category] = {};
					if (!help[command.category].hasOwnProperty(command.subCategory)) help[command.category][command.subCategory] = [];
					const description = util.isFunction(command.description) ? command.description(message.language) : command.description;
					help[command.category][command.subCategory].push({
						nodm: `${prefix}**${command.name}** - \`${description}\``,
						dm: `= ${prefix}${command.name.padEnd(longest)} = :: ${description}`
					});
				}).catch(() => {
					// noop
				})
		));

		return help;
	}

};
