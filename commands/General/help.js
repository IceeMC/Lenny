const Command = require("../../framework/Command.js");
const Paginator = require("../../framework/Paginator.js");
const ArgResolver = require("../../framework/ArgResolver.js");
const { MessageEmbed } = require("discord.js");

class Help extends Command {

	constructor(...args) {
		super(...args, {
            runIn: ["text"],
            noHelp: true,
			aliases: ["commands"],
			description: language => language.get("COMMAND_HELP_DESCRIPTION"),
			usage: "[command:command]"
		});
	}

	async run(message, [command]) {
		if (command) {
			if (command.noHelp && !(await this.client.permChecks.runCheck(command.check, message)).value)
				throw message.language.get("COMMAND_HELP_CMD_CANT_BE_VIEWED", command);
			const embed = new MessageEmbed()
				.setTitle(command.name)
				.setColor(this.client.utils.color)
				.setDescription(`\`${typeof command.description === "function" ? command.description(message.language) : command.description}\``)
				.addField("Usage:", `\`${message.prefix} ${command.usage.helpString}\``)
				.addField("Extra Help:", this.client.utils.codeBlock(typeof command.extendedHelp === "function" ? command.extendedHelp(message.language) : command.extendedHelp, "xl"))
				.setTimestamp()
				.setFooter(`Help requested by ${message.author.tag}`);
			return message.send({ embed });
		}
		const help = await this.buildHelp(message);
		const categories = Object.keys(help).filter(c => help[c].length > 0);
		if (message.guild && message.guild.me.permissions.has(["MANAGE_MESSAGES", "ADD_REACTIONS"])) {
			const helpMenu = new Paginator(message, new MessageEmbed()
				.setColor(this.client.utils.color)
				.setAuthor("Commands (Ones you don't have access too won't show.)", message.author.displayAvatarURL({ format: "png" }))
				.setDescription("Use the buttons to switch between pages.")
			);
			for (let cat = 0; cat < categories.length; cat++) {
				let helpPageValue = "";
				helpPageValue += `${help[categories[cat]].map(c => c.nodm).join("\n")}\n`;
				helpMenu.addPage(new MessageEmbed().addField(`${categories[cat]} Commands`, helpPageValue));
			}
			return await helpMenu.start();
		} else {
			let dmHelp = "";
			for (let cat = 0; cat < categories.length; cat++) {
				let helpPageValue = "\`\`\`ascii\n";
				helpPageValue += `${help[categories[cat]].map(c => c.dm).join('\n')}`;
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
		const categories = Object.keys(help).filter(c => help[c].length > 1);
		let helpStr = "";
		for (let cat = 0; cat < categories.length; cat++) {
			let helpPageValue = "\`\`\`ascii\n";
			helpPageValue += `${help[categories[cat]].map(c => c.dm).join('\n')}`;
			helpPageValue += "\`\`\`\u200b";
			helpStr += `**${categories[cat]} Commands:**\n\n${helpPageValue}`;
		}
		return helpStr;
	}

	async buildHelp(message) {
		const help = {};
		const commands = this.client.storeManager.getStore("commands");
		const { prefix } = message.guild.config;
		const commandNames = commands.keys();
		const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

		for (const command of commands.values()) {
			if (!help[command.category]) help[command.category] = [];
			const description = typeof command.description === "function" ? command.description(message.language) : command.description;
			if (command.noHelp && !(await this.client.permChecks.runCheck(command.check, message).value)) continue;
			help[command.category].push({
				nodm: `${prefix}**${command.name}** - \`${description}\``,
				dm: `= ${prefix}${command.name.padEnd(longest)} = :: ${description}`
			});
		};

		return help;
	}

};

module.exports = Help;
