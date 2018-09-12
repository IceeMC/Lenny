const { Language, util } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require("discord.js");

module.exports = class extends Language {

	constructor(...args) {
		super(...args);
		this.language = {
			DEFAULT: (key) => `${key} has not been localized for en-US yet.`,
			DEFAULT_LANGUAGE: 'Default Language',
			PREFIX_REMINDER: (prefix) => `The prefix${Array.isArray(prefix) ?
				`es for this guild are: ${prefix.map(pre => `\`${pre}\``).join(', ')}` :
				` in this guild is set to: \`${prefix}\``
			}`,
			SETTING_GATEWAY_EXPECTS_GUILD: 'The parameter <Guild> expects either a Guild or a Guild Object.',
			SETTING_GATEWAY_VALUE_FOR_KEY_NOEXT: (data, key) => `The value ${data} for the key ${key} does not exist.`,
			SETTING_GATEWAY_VALUE_FOR_KEY_ALREXT: (data, key) => `The value ${data} for the key ${key} already exists.`,
			SETTING_GATEWAY_SPECIFY_VALUE: 'You must specify the value to add or filter.',
			SETTING_GATEWAY_KEY_NOT_ARRAY: (key) => `The key ${key} is not an Array.`,
			SETTING_GATEWAY_KEY_NOEXT: (key) => `The key ${key} does not exist in the current data schema.`,
			SETTING_GATEWAY_INVALID_TYPE: 'The type parameter must be either add or remove.',
			RESOLVER_INVALID_COLOR: (name) => `${name} must be a valid color (0xFFFFFF).`,
			RESOLVER_INVALID_ROLENAME: (possible) => `${possible.name} must be a valid role name, role id, or role mention.`,
			RESOLVER_MULTIPLE_ROLES: (results) => {
				let index = 0;
				const embed = new MessageEmbed();
				embed.setColor(this.client.utils.color);
				embed.setDescription(`
				I have found multiple roles with that name.
				Choose a roles name from the list below.
				${results.map(r => `${++index}: ${r.name}`).join("\n")}
				`);
				return embed;
			},
			RESOLVER_INVALID_ROLES_CHOICE: (choice, roles) => `${choice} was not in the list of roles. Please choose from ${roles.map(r => `\`${r.name}\``).join(", ")}`,
			RESOLVER_INVALID_MEMBERNAME: (possible) => `${possible.name} must be a valid role member name, member id, or member mention.`,
			RESOLVER_MULTIPLE_MEMBERS: (results) => {
				let index = 0;
				const embed = new MessageEmbed();
				embed.setColor(this.client.utils.color);
				embed.setDescription(`
				I have found multiple members with that name.
				Choose a members name from the list below.
				${results.map(r => `${++index}: ${r.name}`).join("\n")}
				`);
				return embed;
			},
			RESOLVER_INVALID_MEMBER_CHOICE: (choice, members) => `${choice} was not in the list of roles. Please choose from ${members.map(r => `\`${r.name}\``).join(", ")}`,
			RESOLVER_INVALID_CUSTOM: (name, type) => `${name} must be a valid ${type}.`,
			RESOLVER_INVALID_PIECE: (name, piece) => `${name} must be a valid ${piece} name.`,
			RESOLVER_INVALID_MESSAGE: (name) => `${name} must be a valid message id.`,
			RESOLVER_INVALID_USER: (name) => `${name} must be a mention or valid user id.`,
			RESOLVER_INVALID_MEMBER: (name) => `${name} must be a mention or valid user id.`,
			RESOLVER_INVALID_CHANNEL: (name) => `${name} must be a channel tag or valid channel id.`,
			RESOLVER_INVALID_EMOJI: (name) => `${name} must be a custom emoji tag or valid emoji id.`,
			RESOLVER_INVALID_GUILD: (name) => `${name} must be a valid guild id.`,
			RESOLVER_INVALID_ROLE: (name) => `${name} must be a role mention or role id.`,
			RESOLVER_INVALID_LITERAL: (name) => `Your option did not match the only possibility: ${name}`,
			RESOLVER_INVALID_BOOL: (name) => `${name} must be true or false.`,
			RESOLVER_INVALID_INT: (name) => `${name} must be an integer.`,
			RESOLVER_INVALID_FLOAT: (name) => `${name} must be a valid number.`,
			RESOLVER_INVALID_REGEX_MATCH: (name, pattern) => `${name} must follow this regex pattern \`${pattern}\`.`,
			RESOLVER_INVALID_URL: (name) => `${name} must be a valid url.`,
			RESOLVER_INVALID_DATE: (name) => `${name} must be a valid date.`,
			RESOLVER_INVALID_DURATION: (name) => `${name} must be a valid duration string.`,
			RESOLVER_INVALID_TIME: (name) => `${name} must be a valid duration or date string.`,
			RESOLVER_STRING_SUFFIX: ' characters',
			RESOLVER_MINMAX_EXACTLY: (name, min, suffix) => `${name} must be exactly ${min}${suffix}.`,
			RESOLVER_MINMAX_BOTH: (name, min, max, suffix) => `${name} must be between ${min} and ${max}${suffix}.`,
			RESOLVER_MINMAX_MIN: (name, min, suffix) => `${name} must be greater than ${min}${suffix}.`,
			RESOLVER_MINMAX_MAX: (name, max, suffix) => `${name} must be less than ${max}${suffix}.`,
			REACTIONHANDLER_PROMPT: 'Which page would you like to jump to?',
			COMMANDMESSAGE_MISSING: 'Missing one or more required arguments after end of input.',
			COMMANDMESSAGE_MISSING_REQUIRED: (name) => `${name} is a required argument.`,
			COMMANDMESSAGE_MISSING_OPTIONALS: (possibles) => `Missing a required option: (${possibles})`,
			COMMANDMESSAGE_NOMATCH: (possibles) => `Invalid option provided, You can select from the following ${possibles}.`,
			MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error, time) => `${tag} | **${error}** | You have **${time}** seconds to respond to this prompt with a valid argument. Type **"ABORT"** to abort this prompt.`, // eslint-disable-line max-len
			MONITOR_COMMAND_HANDLER_REPEATING_REPROMPT: (tag, name, time) => `${tag} | **${name}** is a repeating argument | You have **${time}** seconds to respond to this prompt with additional valid arguments. Type **"CANCEL"** to cancel this prompt.`, // eslint-disable-line max-len
			MONITOR_COMMAND_HANDLER_ABORTED: 'Aborted',
			MONITOR_AFK_AFK: (afkUser) => `**${afkUser.tag}** has gone afk -> ${afkUser.settings.afk.afkMessage}`,
			INHIBITOR_COOLDOWN: (remaining) => `You have just used this command. You can use this command again in ${remaining} second${remaining === 1 ? '' : 's'}.`,
			INHIBITOR_DISABLED: 'This command is currently disabled.',
			INHIBITOR_MISSING_BOT_PERMS: (missing) => `Insufficient permissions, missing: **${missing}**`,
			INHIBITOR_NSFW: 'You may not use NSFW commands in this channel.',
			INHIBITOR_PERMISSIONS: 'You do not have permission to use this command.',
			INHIBITOR_REQUIRED_CONFIGS: (configs) => `The guild is missing the **${configs.join(', ')}** guild setting${configs.length !== 1 ? 's' : ''} and thus the command cannot run.`,
			INHIBITOR_RUNIN: (types) => `This command is only available in ${types} channels`,
			INHIBITOR_RUNIN_NONE: (name) => `The ${name} command is not configured to run in any channel.`,
			COMMAND_BLACKLIST_DESCRIPTION: 'Blacklists or un-blacklists users and guilds from the bot.',
			COMMAND_BLACKLIST_SUCCESS: (usersAdded, usersRemoved, guildsAdded, guildsRemoved) => [
				usersAdded.length ? `**Users Added**\n${util.codeBlock('', usersAdded.join(', '))}` : '',
				usersRemoved.length ? `**Users Removed**\n${util.codeBlock('', usersRemoved.join(', '))}` : '',
				guildsAdded.length ? `**Guilds Added**\n${util.codeBlock('', guildsAdded.join(', '))}` : '',
				guildsRemoved.length ? `**Guilds Removed**\n${util.codeBlock('', guildsRemoved.join(', '))}` : ''
			].filter(val => val !== '').join('\n'),
			COMMAND_EVAL_DESCRIPTION: 'Evaluates arbitrary Javascript. Reserved for bot owner.',
			COMMAND_EVAL_EXTENDEDHELP: [
				'The eval command evaluates code as-in, any error thrown from it will be handled.',
				'It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.',
				'The --silent flag will make it output nothing.',
				"The --depth flag accepts a number, for example, --depth=2, to customize util.inspect's depth.",
				'The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword',
				'The --showHidden flag will enable the showHidden option in util.inspect.',
				'If the output is too large, it\'ll send the output as a file, or in the console if the bot does not have the ATTACH_FILES permission.'
			].join('\n'),
			COMMAND_EVAL_ERROR: (time, output, type) => `**Error**:${output}\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_OUTPUT: (time, output, type) => `**Output**:${output}\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_SENDFILE: (time, type) => `Output was too long... sent the result as a file.\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_SENDCONSOLE: (time, type) => `Output was too long... sent the result to console.\n**Type**:${type}\n${time}`,
			COMMAND_UNLOAD: (type, name) => `✅ Unloaded ${type}: ${name}`,
			COMMAND_UNLOAD_DESCRIPTION: 'Unloads the klasa piece.',
			COMMAND_UNLOAD_WARN: 'You probably don\'t want to unload that, since you wouldn\'t be able to run any command to enable it again',
			COMMAND_TRANSFER_ERROR: '❌ That file has been transfered already or never existed.',
			COMMAND_TRANSFER_SUCCESS: (type, name) => `✅ Successfully transferred ${type}: ${name}`,
			COMMAND_TRANSFER_FAILED: (type, name) => `Transfer of ${type}: ${name} to Client has failed. Please check your Console.`,
			COMMAND_TRANSFER_DESCRIPTION: 'Transfers a core piece to its respective folder',
			COMMAND_RELOAD: (type, name) => `✅ Reloaded ${type}: ${name}`,
			COMMAND_RELOAD_ALL: (type) => `✅ Reloaded all ${type}.`,
			COMMAND_RELOAD_DESCRIPTION: 'Reloads a klasa piece, or all pieces of a klasa store.',
			COMMAND_REBOOT: 'Rebooting...',
			COMMAND_REBOOT_DESCRIPTION: 'Reboots the bot.',
			COMMAND_LOAD: (time, type, name) => `✅ Successfully loaded ${type}: ${name}. (Took: ${time})`,
			COMMAND_LOAD_FAIL: 'The file does not exist, or an error occurred while loading your file. Please check your console.',
			COMMAND_LOAD_ERROR: (type, name, error) => `❌ Failed to load ${type}: ${name}. Reason:${util.codeBlock('js', error)}`,
			COMMAND_LOAD_DESCRIPTION: 'Load a piece from your bot.',
			COMMAND_PING: new MessageEmbed().setDescription("Pinging...").setColor(this.client.utils.color),
			COMMAND_PING_DESCRIPTION: 'Ping pong?',
			COMMAND_PINGPONG: (diff, ping) => new MessageEmbed()
				.setTitle("Pong!")
				.setDescription(`
Round trip - ${diff}ms
API Ping - ${ping}ms
				`).setColor(this.client.utils.color),
			COMMAND_INVITE: client => new MessageEmbed()
				.setTitle("Invites:")
				.setDescription(`
Want to join the support server? **[Click Here](https://discord.gg/ftsNNMM)**
Want to invite the bot? **[Click Here](${client.invite})**
				`).setColor(this.client.utils.color),
			COMMAND_INVITE_DESCRIPTION: 'Invite or join the support server... What else?',
			COMMAND_HELP_DESCRIPTION: 'Display help for a command.',
			COMMAND_HELP_NO_EXTENDED: 'No extended help available.',
			COMMAND_HELP_USAGE: (usage) => `usage :: ${usage}`,
			COMMAND_HELP_EXTENDED: 'Extended Help ::',
			COMMAND_ENABLE: (type, name) => `+ Successfully enabled ${type}: ${name}`,
			COMMAND_ENABLE_DESCRIPTION: 'Re-enables or temporarily enables a command/inhibitor/monitor/finalizer. Default state restored on reboot.',
			COMMAND_DISABLE: (type, name) => `+ Successfully disabled ${type}: ${name}`,
			COMMAND_DISABLE_DESCRIPTION: 'Re-disables or temporarily disables a command/inhibitor/monitor/finalizer/event. Default state restored on reboot.',
			COMMAND_DISABLE_WARN: 'You probably don\'t want to disable that, since you wouldn\'t be able to run any command to enable it again',
			COMMAND_CONF_NOKEY: 'You must provide a key',
			COMMAND_CONF_NOVALUE: 'You must provide a value',
			COMMAND_CONF_GUARDED: (name) => `${util.toTitleCase(name)} may not be disabled.`,
			COMMAND_CONF_UPDATED: (key, response) => `Successfully updated the key **${key}**: \`${response}\``,
			COMMAND_CONF_KEY_NOT_ARRAY: 'This key is not array type. Use the action \'reset\' instead.',
			COMMAND_CONF_GET_NOEXT: (key) => `The key **${key}** does not seem to exist.`,
			COMMAND_CONF_GET: (key, value) => `The value for the key **${key}** is: \`${value}\``,
			COMMAND_CONF_RESET: (key, response) => `The key **${key}** has been reset to: \`${response}\``,
			COMMAND_CONF_NOCHANGE: (key) => `The value for **${key}** was already that value.`,
			COMMAND_CONF_SERVER_DESCRIPTION: 'Define per-guild configuration.',
			COMMAND_CONF_SERVER: (key, list) => `**Guild Configuration${key}**\n${list}`,
			COMMAND_CONF_USER_DESCRIPTION: 'Define per-user configuration.',
			COMMAND_CONF_USER: (key, list) => `**User Configuration${key}**\n${list}`,
			COMMAND_STATS: (memUsage, uptime, users, guilds, channels, klasaVersion, discordVersion, processVersion, message, players, totalMem, usedMem, freeMem, hostUptime, systemUptime, cpuLoad) => {
				const statsEmbed = new MessageEmbed();
				statsEmbed.setTitle("Bot Statistics");
				statsEmbed.setColor(this.client.utils.color);
				statsEmbed.addField("General", `
Players - ${players}
Users - ${users}
Guilds - ${guilds}
Channels - ${channels}
CPU Load - ${cpuLoad}%
`);
				statsEmbed.addField("Versions", `
Klasa - ${klasaVersion}
Discord.JS - ${discordVersion}
Node.JS - ${processVersion}
`);
				if (this.client.shard) {
					statsEmbed.addField("Shard", `${((message.guild ? message.guild.shardID : message.channel.shardID) || this.client.options.shardId) + 1} / ${this.client.options.shardCount}`)
				}
				statsEmbed.addField("Uptime", `
Bot - ${uptime}
System - ${systemUptime}
Host - ${hostUptime}
				`);
				statsEmbed.addField("Memory (System wide)", `
Process - ${memUsage} MB
Total - ${totalMem} GB
Used - ${usedMem} GB
Free - ${freeMem} GB
`);
				return statsEmbed;
			},
			COMMAND_STATS_DESCRIPTION: 'Provides details about the bot.',
			MESSAGE_PROMPT_TIMEOUT: 'The prompt has timed out.',
			COMMAND_SUDO_DESCRIPTION: "Runs a command as if another user ran it.",

			// Fun
			COMMAND_SOFTWARE_DESCRIPTION: "Gets a random post from r/softwaregore",
			COMMAND_MEME_DESCRIPTION: "Gets a meme from a meme for you :)",

			// Idiotic | Image
			COMMAND_ACHIEVEMENT_DESCRIPTION: "Generate an achievement.",
			COMMAND_BEAUTIFUL_DESCRIPTION: "Makes you or someone else beautiful",
			COMMAND_BLAME_DESCRIPTION: "Blame something. wow rood",
			COMMAND_BOBROSS_DESCRIPTION: "Gives you or someone a bobross makeover.",
			COMMAND_CHALLENGER_DESCRIPTION: "You or someone else can become the challenger.",
			COMMAND_CONFUSED_DESCRIPTION: "Are you confused?",
			COMMAND_CRUSH_DESCRIPTION: "Do you have a crush on someone?",
			COMMAND_BRIGHTEN_DESCRIPTION: "Brightens a user or yourself by 50%",
			COMMAND_DARKEN_DESCRIPTION: "Darkens a user or yourself by 50%",
			COMMAND_GREYSCALE_DESCRIPTION: "Greyscales a user or yourself.",
			COMMAND_INVERT_DESCRIPTION: "Inverts a user or yourself.",
			COMMAND_SEPIA_DESCRIPTION: "Gives someone or yourself a tinge of red.",
			COMMAND_SLAP_DESCRIPTION: "Slaps a user *ouch*.",

			// Games
			COMMAND_TTT_DESCRIPTION: "Allows the user to create, join, leave, or start a ttt game.",
			COMMAND_TTT_EXTENDED_HELP: [
				"Here is a rundown of the sub commands",
				"1. create -> Creates a new game for you.",
				"2. join -> Joins the tic tac toe game.",
				"3. leave -> Removes you from the tic tac toe game.",
				"4. start -> Starts the tic tac toe game."
			].join("\n"),

			// Configuration
			COMMAND_LOGS_DESCRIPTION: "Allows you to enable/disable mod log settings.",
			COMMAND_LOGS_CHANNEL_KEY: (prefix) => `This setting can be configured with \`${prefix}logs channel #channel\``,
			COMMAND_LOGS_NO_KEY: (keys) => `Please provide a key ${keys.map(key => `\`${key}\``).join(", ")}`,
			COMMAND_LOGS_INVALID_KEY: "That is not a valid setting.",
			COMMAND_LOGS_ALREADY_ENABLED: (prefix, key) => `
This setting is already enabled.
To disable it run \`${prefix}logs disable ${key}\``,
			COMMAND_LOGS_ALREADY_DISABLED: (prefix, key) => `
This setting is already disabled.
To enable it run \`${prefix}logs disable ${key}\``,
			COMMAND_LOGS_ENABLE_ALL: "All the modlog settings have been enabled.",
			COMMAND_LOGS_ENABLED: (key) => `Enabled the **${key}** setting.`,
			COMMAND_LOGS_DISABLE_ALL: "All the modlog settings have been disabled.",
			COMMAND_LOGS_DISABLED: (key) => `Disabled the **${key}** setting.`,
			COMMAND_LOGS_CANT_SPEAK: "I can't set that as the mod log channel as I am not allowed to speak there!",
			COMMAND_LOGS_CHANNEL_UPDATED: (channel) => `Updated the logs channel to ${channel}`,
			COMMAND_LOGS_MENTION: "Please mention a channel where the mod logs will show up.",
			COMMAND_PREFIX_DESCRIPTION: "Controls the custom prefix of RemixBot in the server.",
			COMMAND_PREFIX: (name) => `Successfully set my server prefix to **${name}**.`,
			COMMAND_RAW_DESCRIPTION: "Returns the guilds config in a JSON format.",
			COMMAND_STARBOARD_DESCRIPTION: "Allows you to change the limit or channel of the starboard.",
			COMMAND_STARBOARD_LESS_THAN_ZERO: "The limit must be greater than 0.",
			COMMAND_STARBOARD_LIMIT_SAME: "The starboard limit cannot be the same.",
			COMMAND_STARBOARD_NOLIMIT: "You must provide a new limit.",
			COMMAND_STARBOARD_LIMIT_CHANGED: (past, limit) => `The starboard limit was changed from **${past}** to **${limit}**`,
			COMMAND_STARBOARD_CANT_SPEAK: "That channel cannot be the starboard's channel as I can't speak there!",
			COMMAND_STARBOARD_NO_MENTION: "Please mention a channel where the starred message will show up.",
			COMMAND_STARBOARD_CHANNEL_UPDATE: (channel) => `The starboard channel was updated to ${channel}`,
			COMMAND_WELCOMES_DESCRIPTION: "Allows you to enable or disable welcomes and set welcome/leave message.",
			COMMAND_WELCOMES_CANT_SPEAK: "That channel cannot be the welcome/leave channel as I cannot speak there.",
			COMMAND_WELCOMES_CHANNEL_UPDATED: (channel) => `Updates the welcomes/leaves channel to ${channel}`,
			COMMAND_WELCOMES_NO_MENTION: "Please mention a channel for where welcomes/leaves will show up.",
			COMMAND_WELCOMES_ENABLED: "Welcomes/leaves for this server have been enabled successfully.",
			COMMAND_WELCOMES_DISABLED: "Welcomes/leaves for this server have been disabled successfully.",

			// Music
			COMMAND_PLAY_DESCRIPTION: "Plays a song in a voice channel.",
			COMMAND_PLAY_NO_VC: "You must be in a voice channel first to play music!",
			COMMAND_PLAY_NO_TRACKS: "No results found. Try looking for a different song!",
			COMMAND_PLAYLIST_ENQUEUED: (info) => `Playlist **${escapeMarkdown(info.name)}** has been enqueued with ${info.tracks.size} songs.`,
			COMMAND_LOOP_DESCRIPTION: "Loops the current song.",
			COMMAND_LOOP_ENABLE: "Looping has been enabled.",
			COMMAND_LOOP_DISABLE: "Looping has been disabled.",
			COMMAND_QUEUE_DESCRIPTION: "Gets all the songs in the queue and puts them in a nice embed.",
			COMMAND_SKIP_DESCRIPTION: "Skips to a specific song or the next song.",
			COMMAND_STOP_DESCRIPTION: "Stops the current song.",
			COMMAND_LASTSKIP_DESCRIPTION: "Skips to the last song in the queue.",
			COMMAND_NOW_PLAYING_DESCRIPTION: "Gets info on the current playing song.",
			COMMAND_LYRICS_DESCRIPTION: "Gets lyrics about a specific song or the current playing one.",
			COMMAND_MUSIC_NOT_REQUESTER: "You did not request this song.",
			COMMAND_MUSIC_NOT_PLAYING: "There is nothing currently playing. Queue up a song first!",
			COMMAND_MUSIC_END: "The music queue is empty. Queue up a song to keep the party going!",
			COMMAND_MUSIC_PLAYING: (player) => new MessageEmbed()
				.setColor(this.client.utils.color)
				.setTitle(":arrow_right: Now playing!")
				.setDescription(`
-> Song Title: **${escapeMarkdown(player.queue[0].title)}**
-> Song URL: **${player.queue[0].uri}**
-> Song Creator: **${escapeMarkdown(player.queue[0].author)}**
-> Song Requester: **${escapeMarkdown(player.queue[0].requester.tag)}**
-> Song Length: **${player.queue[0].length}**
-> Livestream: **${player.queue[0].isStream ? "Yes" : "No"}**
				`)
				.setTimestamp()
				.setFooter("RemixBot music"),
			COMMAND_MUSIC_ENQUEUED: (track) => new MessageEmbed()
				.setColor(this.client.utils.color)
				.setTitle(":arrow_right: Enqueued!")
				.setDescription(`
-> Song Title: **${escapeMarkdown(track.title)}**
-> Song URL: **${track.uri}**
-> Song Creator: **${escapeMarkdown(track.author)}**
-> Song Requester: **${escapeMarkdown(track.requester.tag)}**
-> Song Length: **${track.length}**
-> Livestream: **${track.isStream ? "Yes" : "No"}**
				`)
				.setTimestamp()
				.setFooter("RemixBot music"),

			// Utility
			COMMAND_SERVERINFO_DESCRIPTION: "Gets info about a server.",
			COMMAND_USERINFO_DESCRIPTION: "Gets info about you or another user.",
			COMMAND_ROLEINFO_DESCRIPTION: "Gets info about a role.",
			COMMAND_REMIND_DESCRIPTION: "Sets a reminder for you.",
			COMMAND_TAG_DESCRIPTION: "Allows you to do stuff with tags",
			COMMAND_TAG_EXTENDED_HELP: [
				"This command can be somewhat confusing so here is some more help :p",
				"If you pass no sub command it will try and find the tag by the the name you pass.",
				"1. add -> Adds a new tag with the provided name and content",
				"2. create -> Its the same thing as add",
				"3. edit -> Edits a tag you own. Admins can use this too.",
				"4. all -> Gets all of the guilds tags",
				"5. delete -> Deletes a tag from the guild by the tags name. Admins can use this too.",
				"6. get -> Gets info about a tag by the name.",
				"Here are some examples",
				"1. r.tag add hello Hello there",
				"-> Adds a tag with the name: hello and the content: Hello there",
				"2. r.tag create hello Hello there",
				"--> Its the same thing as add",
				"3. r.tag all",
				"---> Sends an embed with all the servers tags",
				"4. r.tag edit hello Hello person",
				"----> Edits a tag with the new tag content",
				"5. r.tag delete hello",
				"-----> Deletes the hello tag",
				"6: r.tag get hello",
				"------> Sends a embed in the channel containing info about the tag also with the tags content."
			].join("\n"),
			COMMAND_AFK_DESCRIPTION: "Sets or removes you from the afk status.",
			COMMAND_AFK_NO_MESSAGE: "Please provide a afk message.",
			COMMAND_AFK_GONE_AFK: (afkMessage) => `Ok! You are now afk for \`${afkMessage}\``,
			COMMAND_COLOR_DESCRIPTION: "It gets a color... What else?",
			COMMAND_SOURCE_DESCRIPTION: "Gets the source of a klasa piece",
		};
	}

	async init() {
		await super.init();
	}

};
