const { Command, RichDisplay, util } = require('klasa');
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['commands'],
			guarded: true,
			description: language => language.get('COMMAND_HELP_DESCRIPTION'),
			usage: '(Command:command)'
		});

		this.createCustomResolver('command', (arg, possible, message) => {
			if (!arg || arg === '') return undefined;
			return this.client.arguments.get('command').run(arg, possible, message);
		});
	}

	async run(message, [command]) {
		const helpMenu = new RichDisplay(new MessageEmbed()
			.setColor(0xFFFFFF)
			.setTitle("Bot Commands")
			.setDescription("Use the reactions to switch between pages.")
		);
		if (command) {
			const info = [
				`= ${command.name} = `,
				util.isFunction(command.description) ? command.description(message.language) : command.description,
				message.language.get('COMMAND_HELP_USAGE', command.usage.fullUsage(message)),
				message.language.get('COMMAND_HELP_EXTENDED'),
				util.isFunction(command.description) ? command.extendedHelp(message.language) : command.extendedHelp
			].join('\n');
			return message.send(info, { code: 'asciidoc' });
		}
		const help = await this.buildHelp(message);
		const categories = Object.keys(help);
		for (let cat = 0; cat < categories.length; cat++) {
			const subCategories = Object.keys(help[categories[cat]]);
			const embed = new MessageEmbed();
			embed.setColor(this.client.utils.color);
			let helpPageValue = "";
			for (let subCat = 0; subCat < subCategories.length; subCat++)
				helpPageValue += `**${subCategories[subCat]}**\n\n${help[categories[cat]][subCategories[subCat]].join('\n')}\n`;
			embed.addField(`${categories[cat]} Commands`, helpPageValue);
			helpMenu.addPage(embed);
		}

		return helpMenu.run(await message.send("Loading..."), { filter: (reaction, user) => user.id === message.author.id });
	}

	async buildHelp(message) {
		const help = {};

		const { prefix } = message.guildSettings;
		const commandNames = [...this.client.commands.keys()];
		const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

		await Promise.all(this.client.commands.map((command) =>
			this.client.inhibitors.run(message, command, true)
				.then(() => {
					if (!help.hasOwnProperty(command.category)) help[command.category] = {};
					if (!help[command.category].hasOwnProperty(command.subCategory)) help[command.category][command.subCategory] = [];
					const description = util.isFunction(command.description) ? command.description(message.language) : command.description;
					help[command.category][command.subCategory].push(`${prefix}**${command.name}** - \`${description}\``);
				})
				.catch(() => {
					// noop
				})
		));

		return help;
	}

};
