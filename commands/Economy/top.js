const Command = require("../../framework/Command.js");
const { int } = require("../../framework/ArgResolver.js");
const Paginator = require("../../framework/Paginator.js");
const { MessageEmbed } = require("discord.js");

class Top extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: language => language.get("COMMAND_TOP_DESCRIPTION"),
            usage: "[num:int]",
            aliases: ["top10", "topten", "leaderboard", "lboard"]
        });
    }

    async run(message, [num = 1]) {
        // if (type === "global") {
        //     await message.send("Give me a few mins! I need to sort through all this data...");
        //     const topGlobalMembers = this.client.guilds
        //         .reduce((arr, g) => [...arr, ...g.members.filter(filter.bind(this)).array()], [])
        //         .sort(sorter.bind(this)); // Can take a while
        //     const memberPos = topGlobalMembers.indexOf(message.member) === -1 ? "?!?!?" : topGlobalMembers.indexOf(message.member) + 1;
        //     const pages = [];
        // }
        // await message.send("<a:outlinedblob:515017253830524929> Give me a few! I need to sort through all this data...");
        const sorted = message.guild.members
            .filter(m => !m.user.bot && m.config.coins > 0)
            .array()
            .sort((a, b) => b.config.coins > a.config.coins ? 1 : -1);
        if (!(sorted.length >= 10)) throw "<:oof:445702123666145291>, I couldn't fetch the top ten members. Is this place abandoned?";
        const memberPos = sorted.indexOf(message.member) === -1 ? "???" : sorted.indexOf(message.member) + 1;
		if (message.guild.me.permissions.has(["MANAGE_MESSAGES", "ADD_REACTIONS"])) {
            const paginator = new Paginator(message, new MessageEmbed()
                .setTitle("Guild leaderboard")
                .setColor(this.client.utils.color)
                .setTimestamp()
                .setFooter(`Your leaderboard position: ${memberPos}`)
            );
            for (let i = 0; i < sorted.length; i += 10) {
                const slicedSort = sorted.slice(i, i + 10);
                const template = new MessageEmbed()
                    .setDescription(slicedSort.map(m => `**•**: \`${m.user.tag}\` (Coins: ${m.config.coins} | Lvl: ${m.config.level})`).join("\n"));
                paginator.addPage(template);
            }
            await paginator.start();
        } else {
            const pages = [];
            for (let i = 0; i < sorted.length; i += 10) {
                const slicedSort = sorted.slice(0, 10);
                pages.push(slicedSort
                    .map(m => `**•**: \`${m.user.tag}\` (Coins: ${m.config.coins} | Lvl: ${m.config.level})`)
                    .join("\n")
                );
            }
            num = int(num);
            if (num > pages.length)
                throw `There are only \`${pages.length}\` pages <:blobsweating:515044285821878298>; Try selecting a value lower than that.`;
            const curPage = pages[num - 1];
            await message.send(new MessageEmbed()
                .setAuthor(`Showing page [${num}/${pages.length}]`)
                .setTitle("Guild leaderboard")
                .setColor(this.client.utils.color)
                .setDescription(curPage)
                .setTimestamp()
                .setFooter(`Your leaderboard position: ${memberPos}`)
            );
        }
    }

}

module.exports = Top;