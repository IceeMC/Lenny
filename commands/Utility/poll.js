const Command = require("../../framework/Command.js");
const { MessageEmbed } = require("discord.js");
const channelRgx = /^(?:<#([0-9]{17,20})>|([0-9]{17,20}))$/;

class Poll extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: language => language.get("COMMAND_POLL_DESCRIPTION"),
            aliases: ["createpoll", "makepoll"],
            usage: "[chan:string]",
            extendedHelp: language => language.get("COMMAND_POLL_EXTENDED_HELP"),
            perms: ["ADD_REACTIONS"]
        });
    }

    async run(message, [chan = ""]) {
        //if ((!chan || channelRgx.test(chan)) && !question.length) {
        const channel = message.mentions.channels.size > 0 && !chan ?
            message.mentions.channels.first() :
            chan && channelRgx.test(chan) ? message.guild.channels.get(channelRgx.exec(chan)[1]) : message.channel;
        if (!channel) throw "Sorry, but I could not find the specified channel. Make sure to mention the channel, or provide a channel id.";
        if (!channel.permissionsFor(message.member).has("SEND_MESSAGES")) throw "You can't create polls in that channel.";
        if (!channel.postable) throw "I can't post polls in the channel. Missing permission: \`Send Messages\`";
        let q = (await message.prompt("What would you like the poll to be about?")).content;
        let curIndex = 0;
        let choices = [];
        let lastContent;
        do {
            const prompted = await message.prompt("Enter a poll choice or type \`post\`, \`send\` or \`publish\` to post the poll.");
            choices.push(prompted);
            lastContent = prompted.content;
            curIndex++;
        } while (!["post", "send", "publish"].includes(lastContent) && curIndex <= 10);
        if (choices.filter(c => ["post", "send", "publish"].includes(c.content)).length > 0) choices.pop();
        if (choices.length < 2) throw "You must provide two or more poll choices.";
        const pollEmbed = new MessageEmbed();
        pollEmbed.setTitle("Polls");
        pollEmbed.setThumbnail(message.author.displayAvatarURL({ size: 2048 }));
        pollEmbed.setColor("RANDOM");
        pollEmbed.addField(
            q.endsWith("?") ? this.client.clean(message, q) : `${this.client.clean(message, q)}?`,
            choices.map((c, i) => `\`${++i}\`: ${this.client.clean(message, c.content)}`).join("\n")
        );
        pollEmbed.setTimestamp();
        pollEmbed.setFooter(`Asker: ${message.author.tag} (${message.author.id})`);
        const pollMsg = await channel.send(pollEmbed);
        await Promise.all(choices.map(async (_, i) => await pollMsg.react(this.getEmoji(i))));
        if (channel.id !== message.channel.id) await message.channel.send(`Success! I've posted the poll in ${channel}.`);
        // } else {
        //     const channel = message.mentions.channels.size > 0 && !chan ?
        //         message.mentions.channels.first() :
        //         chan && channelRgx.test(chan) ? message.guild.channels.get(channelRgx.exec(chan)[1]) : message.channel;
        //     if (!channel) throw "Sorry, but I could not find the specified channel. Make sure to mention the channel.";
        //     if (!channel.permissionsFor(message.member).has("SEND_MESSAGES")) throw "You can't create polls in that channel.";
        //     if (!channel.postable) throw "I can't post polls in the channel. Missing permission: \`Send Messages\`";
        //     const [q, ...choices] = [
        //         chan && channelRgx.test(chan) ? question.split("/")[0] : `${chan} ${question.split("/")[0]}`,
                
        //     ];
        //     if (!q)
        //         throw "Invalid usage. The correct usage is \`cn.poll [#channel] question/choice1/choice2/...\`, note that channel is optional.";
        //     if (choices.length < 2) throw "You must provide two or more poll choices.";
        //     if (choices.length > 10) throw "Maximum of 10 poll choices reached.";
        //     const pollEmbed = new MessageEmbed();
        //     pollEmbed.setTitle("Polls");
        //     pollEmbed.setThumbnail(message.author.displayAvatarURL({ size: 2048 }));
        //     pollEmbed.setColor("RANDOM");
        //     pollEmbed.addField(
        //         q.endsWith("?") ? this.client.clean(message, q) : `${this.client.clean(message, q)}?`,
        //         choices.map((c, i) => `\`${++i}\`: ${this.client.clean(message, c)}`).join("\n")
        //     );
        //     pollEmbed.setTimestamp();
        //     pollEmbed.setFooter(`Asker: ${message.author.tag} (${message.author.id})`);
        //     const pollMsg = await channel.send(pollEmbed);
        //     await Promise.all(choices.map(async (_, i) => await pollMsg.react(this.getEmoji(i))));
        //     if (channel.id !== message.channel.id) await message.channel.send(`Success! I've posted the poll in ${channel}.`);
        // }
    }

    getEmoji(index) {
        const emojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
        return emojis[index];
    }

}

module.exports = Poll;