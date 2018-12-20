const Language = require("../framework/Language.js");
const { MessageEmbed, Util: { escapeMarkdown } } = require("discord.js");
const checks = {
    0: "User",
    2: "Beta Tester",
    3: "Premium",
    5: "Guild Manager",
    6: "Moderator",
    7: "Administrator",
    8: "Server Owner",
    10: "Bot Owner"
};

class EnUS extends Language {

    constructor(...args) {
        super(...args, { name: "en-US" });
        this.responses = {
            // General
            NO_LOCALIZATION_YET: key => `${key} was not localized for language en-US yet.`,
            PREFIX_REMINDER: prefix => `Since you needed the prefix, It's \`${prefix}\``,
            CHECK_NO_PERMISSION: level => `Uh-oh! You're missing the following level: \`${level} (${checks[level]})\``,
            // Tags
            TAG_ARG_REQUIRED: ({ name }) => `Hey! You seem to have forgotten the argument: \`${name}\`.`,
            SUB_COMMAND_INVALID: (t) => `Hey! Your option did not match any of the following: ${t.map(t => `\`${t}\``).join(", ")}`,
            TAG_BAD_LENGTH: ({ name, min, max }) =>
                `Hey! Keep the length of \`${name}\` less than ${max} character${max>0?"s":""}, and greater than ${min} character${min>0?"s":""}`,
            // Args
            ARG_BAD_MEMBER: "Hey! You provided an invalid member, make sure you provide a valid id, username, username#discriminator, or mention.",
            ARG_BAD_USER: "Hey! You provided an invalid user, make sure you provide a valid id, username, username#discriminator, or mention.",
            ARG_BAD_BOOLEAN: "Hey! You provided an invalid boolean, make sure you provide true, or false",
            ARG_BAD_INT: "Hey! You provided an invalid integer, make sure that its a number of course.",
            BANANAPI_ERROR: text => text,
            NSFW_CHANNEL_NO_NSFW: "Are you serious? Stop! You don't need to be killing people's eyes with that garbage!",
            USER_AFK: (user) => `<a:PepeHmm:473938687290245121> \`${user.username}\` has gone AFK for: \`${user.config.afk.message}\``,
            SERVER_CMD_DISABLED: ({ member: { user }, command: { name } }) =>
                `Hey ${user}! \`${name}\` has been disabled from being used server-wide.`,
            CMD_DISABLED: ({ member: { user }, command: { name } }) => `${user}, \`${name}\` has been disabled from being used globally.`,
            MEMBER_LEVEL_UP: ({ config: { level }, user }) => `${user}, You've leveled up to level \`${level}\`!`,
            COMMAND_DM_SUCCESS: "Help has been sent to your DMs!",
            CMD_ON_CD: ({ name }, tryAgain) => `Sorry, but \`${name}\` is currently on cooldown; Try again in **${tryAgain}**!`,
            COMMAND_HELP_CMD_CANT_BE_VIEWED: command => `Sorry, but \`${command.name}\` can't be viewed.`,
            ROLE_HIERARCHY: "Sorry! But due to role hierarchy, I am not allowed to run the following command.",
            MEMBER_HIERARCHY: "Sorry! But do to member hierarchy, I am not allowed to run the following command.",
            COMMAND_HELP_DESCRIPTION: "Displays the help... Duh!",
            COMMAND_PING_DESCRIPTION: "Pings discord.",
            COMMAND_SAY_DESCRIPTION: "Say something as me.",
			COMMAND_PINGPONG: (diff, ping) => new MessageEmbed()
				.setTitle("Pong!")
				.setDescription(`
Round trip - ${diff}ms
API Ping - ${ping}ms
                `).setColor(this.client.utils.color),
            COMMAND_STATS: (memUsage, uptime, users, guilds, channels, discordVersion, processVersion, message, players, totalMem, usedMem, freeMem, hostUptime, systemUptime, cpuLoad) => {
                const statsEmbed = new MessageEmbed();
                statsEmbed.setTitle("Bot Statistics!");
                statsEmbed.setColor(this.client.utils.color);
                statsEmbed.addField("General", `
Players - ${players}
Users - ${users}
Guilds - ${guilds}
Channels - ${channels}
CPU Load - ${cpuLoad}%
`);
                statsEmbed.addField("Versions", `
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
            COMMAND_STATS_DESCRIPTION: "Provides details about the bot.",
            COMMAND_SUDO_DESCRIPTION: "Runs a command as if another user ran it.",

            // Fun/Idiotic
            COMMAND_SOFTWARE_DESCRIPTION: "Gets a random post from r/softwaregore",
            COMMAND_MEME_DESCRIPTION: "Gets a meme from a meme for you :)",
            COMMAND_SPONGEBOB_DESCRIPTION: "maKeS YoUr tExT LiKe tHiS",
            COMMAND_STAR_DESCRIPTION: "Creates a star.",
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
            COMMAND_TWEET_DESCRIPTION: "Tweet something as trump.",
            COMMAND_DISABLED_DESCRIPTION:  "This seat is reserved for disabled people!",
            COMMAND_EMOJIFY_DESCRIPTION: "Converts the text into emojis.",
            COMMAND_HASH_DESCRIPTION: "Hashes the text you provide.",
            COMMAND_HEADACHE_DESCRIPTION: "The types of headaches are insane.",
            COMMAND_HUMANSGOOD_DESCRIPTION: "Humans are good!",
            COMMAND_JSIFY_DESCRIPTION: "Converts the text into js",
            COMMAND_PEEKABOO_DESCRIPTION: "Peekaboo?",
            COMMAND_REVERSE_DESCRIPTION: "Reverses the text.",
            COMMAND_REVERSE_TEXT_TOO_LONG: "The text is too long. Keep it under 500 characters!",
            COMMAND_SPLIT_DESCRIPTION: "Takes the first half of an image and merges it with the other half.",
            COMMAND_TWEET_DESCRIPTION: "Tweet something as trump.",
            COMMAND_RANDOM_EMOJI_DESCRIPTION: "Gets an random emoji from a random server.",

            // Misc
            COMMAND_NICK_DESCRIPTION: "Changes a members nickname.",
            COMMAND_NICK_EXTENDED_HELP: [
                "Examples",
                "1. cn.nick me <nickname>",
                "1a. This changes your nickname to <nickname>",
                "2. cn.nick bot <nickname>",
                "2a. This changes the bots nickname to <nickname>",
                "3. cn.nick @Ice#1234 <nickname>",
                "3a. This changes Ice#1234's nickname to <nickname>"
            ],
            COMMAND_NICK_LIMIT: "Sorry! But nicknames can't be over/equal to 32 characters.",
            COMMAND_NICK_SUCCESS: ({ member, guild: { me } }, nicked, nick) => `Success! I've changed ${member === nicked ? "your nickname" : member === me ? "my nickname" : `${nicked.user.tag}'s nickname`} to \`${nick}\``,
            COMMAND_PERM_LEVEL_DESCRIPTION: "Gets your highest permission level.",
            COMMAND_PERM_LEVEL: level => `Your current permission level is: \`${level} (${checks[level]})\``,

            // Games
            COMMAND_TTT_DESCRIPTION: "Allows the user to create, join, leave, or start a ttt game.",
            COMMAND_TTT_EXTENDED_HELP: [
                "Here is a rundown of the sub commands",
                "1. create -> Creates a new game for you.",
                "2. join -> Joins the tic tac toe game.",
                "3. leave -> Removes you from the tic tac toe game.",
                "4. start -> Starts the tic tac toe game."
            ],
            COMMAND_UNO_DESCRIPTION: "Play a game of uno with your friends (WIP).",

            // Configuration
            COMMAND_LEVELUPS_DESCRIPTION: "Allows you to enable/disable level up messages.",
            COMMAND_LEVELUPS_ENABLED: v => `Success! Level ups are now ${v ? "enabled" : "disabled"}`,
            COMMAND_MANAGE_CMDS_DESCRIPTION: "Allows you to enable/disable commands for the server.",
            COMMAND_MANAGE_CMDS_DISABLED_CMD: ({ name }) => `Success! Disabled command \`${name}\`.`,
            COMMAND_MANAGE_CMDS_ENABLED_CMD: ({ name }) => `Success! Enabled command \`${name}\`.`,
            COMMAND_LOGS_DESCRIPTION: "Allows you to control various mod-log settings.",
            COMMAND_LOGS_CHANNEL_KEY: (prefix) => `This setting can be configured with \`${prefix}logs channel #channel\`.`,
            COMMAND_LOGS_NO_KEY: (keys) => `Please provide a key. Select from the following: ${keys.map(key => `\`${key}\``).join(", ")}`,
            COMMAND_LOGS_INVALID_KEY: "That's not a setting.",
            COMMAND_LOGS_ALREADY_ENABLED: (prefix, key) => `That setting is enabled; however, to disable it run \`${prefix}logs enable ${key}\``,
            COMMAND_LOGS_ALREADY_ENABLED_ALL: "Sorry, but all mod-log actions are enabled.",
            COMMAND_LOGS_ALREADY_DISABLED_ALL: "Sorry, but all the mod-log actions are disabled.",
            COMMAND_LOGS_ALREADY_DISABLED: (prefix, key) => `That setting is disabled; however, to enable it run \`${prefix}logs enable ${key}\``,
            COMMAND_LOGS_ENABLE_ALL: "All the modlog settings have been enabled.",
            COMMAND_LOGS_ENABLED: (key) => `Enabled the **${key}** setting.`,
            COMMAND_LOGS_DISABLE_ALL: "All the modlog settings have been disabled.",
            COMMAND_LOGS_DISABLED: (key) => `Disabled the **${key}** setting.`,
            COMMAND_LOGS_CANT_SPEAK: "I can't set that as the mod log channel as I am not allowed to speak there!",
            COMMAND_LOGS_CHANNEL_UPDATED: (channel) => `Updated the logs channel to ${channel}`,
            COMMAND_LOGS_MENTION: "Please mention a channel where the mod logs will show up.",
            COMMAND_PREFIX_DESCRIPTION: "Controls the custom prefix of RemixBot in the server.",
            COMMAND_PREFIX_CHANGED: (prefix) => `Success! The server prefix was changed to \`${prefix}\`.`,
            COMMAND_PREFIX_LIMIT_TRUE: "Error! Keep prefix greater than 1 character and less than 5 characters.",
            COMMAND_PREFIX_NULL: "Hey! Provide a new prefix, will ya?",
            COMMAND_RAW_DESCRIPTION: "Returns the guilds config as JSON.",
            COMMAND_STARBOARD_DESCRIPTION: "Allows you to change the limit/channel for the starboard.",
            COMMAND_STARBOARD_LESS_THAN_ZERO: "The limit must be greater than 0.",
            COMMAND_STARBOARD_LIMIT_SAME: "The starboard limit can't be the same as the old limit.",
            COMMAND_STARBOARD_NOLIMIT: "Cmon man, You can't just leave the ",
            COMMAND_STARBOARD_LIMIT_CHANGED: (past, limit) => `The starboard limit was changed from **${past}** to **${limit}**`,
            COMMAND_STARBOARD_CANT_SPEAK: "That channel cannot be the starboard's channel as I can't speak there!",
            COMMAND_STARBOARD_NO_MENTION: "Please mention a channel where the starred message will show up.",
            COMMAND_STARBOARD_CHANNEL_UPDATE: (channel) => `The starboard channel was updated to ${channel}`,
            COMMAND_WELCOMES_DESCRIPTION: "Allows you to enable or disable welcomes and set welcome/leave message.",
            COMMAND_WELCOMES_CANT_SPEAK: "That channel cannot be the welcome/leave channel as I cannot speak there.",
            COMMAND_WELCOMES_CHANNEL_UPDATED: (channel) => `Updates the welcomes/leaves channel to ${channel}`,
            COMMAND_WELCOMES_NO_MENTION: "Please mention a channel for where welcomes/leaves will show up.",
            COMMAND_WELCOMES_ENABLED: "Welcomes/leaves for this server were enabled successfully.",
            COMMAND_WELCOMES_DISABLED: "Welcomes/leaves for this server were disabled successfully.",

            // Economy
            COMMAND_DAILY_DESCRIPTION: "Claim your daily bonus!",
            COMMAND_DAILY_ALREADY_CLAIMED: duration => `You have already claimed your daily bonus. You can claim again in \`${duration}\`.`,
            COMMAND_DAILY_CLAIMED: (amount, voted) => `You were given \`${voted ? `${amount} (An extra thousand were added because you upvoted)` : amount}\` coins as your daily bonus. Check back tomorrow!`,

            // Music
            COMMAND_PLAY_DESCRIPTION: "Plays a song in a voice channel.",
            COMMAND_PLAY_NO_VC: "Get in a voice channel first! So I can play music.",
            COMMAND_PLAY_NO_PERMS: "Sorry, but in order for me to play music I need the following permissions: \`Connect\`, and \`Speak\`",
            COMMAND_PLAY_NO_TRACKS: search => `\`${escapeMarkdown(search)}\` returned no results... Look for something else.`,
            COMMAND_PLAYLIST_ENQUEUED: info => `Playlist **${escapeMarkdown(info.name)}** has been enqueued with ${info.tracks ? info.tracks.size : info.length} songs.`,
            COMMAND_LOOP_DESCRIPTION: "Loops the current song.",
            COMMAND_LOOP_CHANGED: (value) => `Success! Looping was ${value ? "enabled" : "disabled"}`,
            COMMAND_QUEUE_DESCRIPTION: "Displays the current music queue.",
            COMMAND_SKIP_DESCRIPTION: "Skips to a specific song or the next song.",
            COMMAND_STOP_DESCRIPTION: "Stops the current song.",
            COMMAND_EARRAPE_DESCRIPTION: "Earrapes the current volume. I AM NOT RESPONSIBLE FOR ANY DAMAGED EARS USING THIS COMMAND.",
            COMMAND_EARRAPE_SUCCESS: limit => `Success! The channel was just earraped by ${(limit / 100) * 100}%`,
            COMMAND_LASTSKIP_DESCRIPTION: "Skips to the last song in the queue.",
            COMMAND_NOW_PLAYING_DESCRIPTION: "Gets info on the current song.",
            COMMAND_LYRICS_DESCRIPTION: "Gets the lyrics for a specific song, or the current one.",
            COMMAND_MUSIC_NOT_REQUESTER: "You did not request this song.",
            COMMAND_MUSIC_NOT_PLAYING: "There is nothing currently playing. Queue up a song first!",
            COMMAND_MUSIC_END: "The music queue is empty. Queue up a song to keep the party going!",
            COMMAND_MUSIC_PLAYING: player => new MessageEmbed()
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
            COMMAND_MUSIC_ENQUEUED: track => new MessageEmbed()
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
            COMMAND_VOLUME_DESCRIPTION: "Change's the volume of the current playing song.",
            COMMAND_VOLUME_SET: (oldVol, newVol) => `Success! Volume changed from \`${oldVol}\` to \`${newVol}\`.`,

            // NSFW
            COMMAND_HENTAI_DESCRIPTION: "Gets a picture of hentai. !! NSFW !!",
            COMMAND_BOOBS_DESCRIPTION: "Gets a picture of boobs. !! NSFW !!",
            COMMAND_FEET_DESCRIPTION: "Gets a picture of feet. !! NSFW !!",
            COMMAND_PORNPFP_DESCRIPTION: "Gets an porn profile picture. !! NSFW !!",
            COMMAND_NEKO_DESCRIPTION: "Gets a avatar that is porn related. !! NSFW !!",
            COMMAND_LESBIAN_DESCRIPTION: "Gets a picture of lesbians. !! NSFW !!",

            // Utility
            COMMAND_AFK_ALREADY_AFK: (prefix) => `Sorry, but you can't go AFK again, you can clear it with \`${prefix}afk remove\`.`,
            COMMAND_AFK_SET: (afkMessage) => `Success! You have gone AFK: \`${afkMessage}\`. Members who mention you will be notified.`,
            COMMAND_AFK_NOT_AFK: (prefix) => `Sorry, but you are not currently AFK, you can set it with \`${prefix}afk set <message>\`.`,
            COMMAND_AFK_REMOVE: `Success! You are no longer AFK. <a:BlobSmile:469418948069163008>`,
            COMMAND_BASE_64_DESCRIPTION: "Encodes a string or decodes a base64 encoded string.",
            COMMAND_SERVERINFO_DESCRIPTION: "Gets info about a server.",
            COMMAND_USERINFO_DESCRIPTION: "Gets info about you or another user.",
            COMMAND_ROLEINFO_DESCRIPTION: "Gets info about a role.",
            COMMAND_REMIND_DESCRIPTION: "Sets a reminder for you.",
            COMMAND_TAG_DESCRIPTION: "Allows you to do stuff with tags",
            COMMAND_TAG_EXTENDED_HELP: (prefix) => [
                "This command can be somewhat confusing so here is some more help.",
                "If you pass no sub command it will try and find the tag by the the name you pass.",
                "1. add -> Adds a new tag with the provided name and content",
                "2. create -> Its the same thing as add",
                "3. edit -> Edits a tag you own. Admins can use this too.",
                "4. all -> Gets all of the guilds tags",
                "5. delete -> Deletes a tag from the guild by the tags name. Admins can use this too.",
                "6. get -> Gets info about a tag by the name.",
                "Here are some examples",
                `1. ${prefix}tag add hello Hello there`,
                "-> Adds a tag with the name: hello and the content: Hello there",
                `2. ${prefix}tag create hello Hello there`,
                "--> Its the same thing as add",
                `3. ${prefix}tag all`,
                "---> Sends an embed with all the servers tags",
                `4. ${prefix}tag edit hello Hello person`,
                "----> Edits a tag with the new tag content",
                `5. ${prefix}tag delete hello`,
                "-----> Deletes the hello tag",
                `6: ${prefix}tag get hello`,
                "------> Sends a embed in the channel containing info about the tag also with the tags content."
            ].join("\n"),
            COMMAND_AFK_DESCRIPTION: "Sets or removes you from the afk status.",
            COMMAND_AFK_NO_MESSAGE: "Please provide a afk message.",
            COMMAND_AFK_GONE_AFK: (afkMessage) => `Ok! You are now afk for \`${afkMessage}\``,
            COMMAND_COLOR_DESCRIPTION: "It gets a color... What else?",
            COMMAND_CREATE_EMOJI_DESCRIPTION: "Creates an emoji using the provided url or id.",
            COMMAND_CREATE_EMOJI_SUCCESS: (created, name) => `Alright, that was a success! I've added the emoji: ${created} (${name}).`,
            COMMAND_MDN_DESCRIPTION: "Gets info from the MDN documentation.",
            COMMAND_POLL_DESCRIPTION: "Creates a poll!",
            COMMAND_SOURCE_DESCRIPTION: "Gets the source for a command, event, or language."
        };
    }

}

module.exports = EnUS;