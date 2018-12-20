const { MessageEmbed } = require("discord.js");

class Paginator {

    constructor(msg, template = new MessageEmbed(), pages = [], useTemplateFooter = false) {
        this.msg = msg;
        this.template = template;
        this.collectors = {
            reaction: null,
            message: null
        };
        this.sentMsg = null;
        this.reactor = msg.author;
        this.pages = pages;
        this.currentPage = 0;
        this.enabled = false;
        this.emotes = ["⏪", "⬅", "➡", "⏩", "⏸", "🔢"];
        this.useTemplateFooter = useTemplateFooter;
    }

    async start() {
        if (!this.enabled) await this.switchPage(0);
        this.collectors.reaction = this.sentMsg.createReactionCollector((reaction, user) => this.emotes.includes(reaction.emoji.name) && user.id === this.reactor.id && reaction.users.remove(user.id).catch(() => null),{ time: 864e5 });
        this.collectors.reaction.on("collect", async r => {
            switch (r.emoji.name) {
                case "⏪": return await this.firstPage();
                case "⬅": return await this.backward();
                case "➡": return await this.forward();
                case "⏩": return await this.lastPage();
                case "⏸": return await this.end();
                case "🔢": return await this.userInputPageSwitch();
            }
        });
        this.collectors.reaction.on("end", () => this.end());
    }

    addPage(template) {
        if (template instanceof MessageEmbed) return this.pages.push(template);
        return this.pages.push(template.call(null, new MessageEmbed()));
    }

    async switchPage(pageNum) {
        if (this.enabled) {
            if (pageNum <= -1) return; // Negative index
            if (pageNum >= this.pages.length) return; // Past or equal to the total pages.
            this.currentPage = pageNum;
            return this.sentMsg.edit(this.generateEmbed(this.pages[this.currentPage]));
        } else {
            this.enabled = true;
            this.sentMsg = await this.msg.channel.send(this.generateEmbed(this.pages[0]));
            for (const emote of this.emotes) {
                if (["⏪", "⏩", "🔢"].includes(emote) && this.pages.length < 2) continue;
                await this.sentMsg.react(emote).catch(() => null);
            }
        }
    }

    async forward() {
        return await this.switchPage(this.currentPage + 1);
    }

    async backward() {
        return await this.switchPage(this.currentPage - 1);
    }

    async lastPage() {
        return await this.switchPage(this.pages.length - 1);
    }

    async firstPage() {
        return await this.switchPage(0);
    }

    async userInputPageSwitch() {
        const tm = await this.msg.channel.send("What page would you like to go to?\n**NOTE: This times out in 20 seconds, you can reply with `cancel`, `stop` to stop this selection.**");
        this.collectors.message = this.msg.channel.createMessageCollector(m => m.author.id === this.reactor.id, { time: 20000, errors: ["time"] });
        this.collectors.message.on("collect", async m => {
            if (m.content.search(/(cancel|quit)/i) > -1) {
                await tm.delete({ timeout: 2500 });
                return this.collectors.message.stop();
            }
            if (!this.pages[parseInt(m.content) - 1]) {
                const temp = await this.msg.channel.send(`Invalid page provided \`[${isNaN(m.content) ? m.content : parseInt(m.content)}/${this.pages.length}\`]`)
                await temp.delete({ timeout: 2500 });
            } else {
                this.switchPage(parseInt(m.content) - 1);
            }
            await tm.delete();
            this.collectors.message.stop();
        });
        this.collectors.message.on("end", async ({ size }) => {
            if (size < 1) {
                const t = await this.msg.channel.send("The selection timed out!");
                return await t.delete({ timeout: 2500 });
            }
        });
    }

    async end() {
        if (this.collectors.message && !this.collectors.message.ended) this.collectors.message.stop();
        await this.sentMsg.delete().catch(() => null);
    }

    generateEmbed(embed) {
        if (this.template) {
            if (this.template.author) {
                const { name, iconURL, url } = this.template.author;
                embed.setAuthor(name, iconURL, url);
            }
            if (this.template.description) embed.setDescription(this.template.description);
            if (this.template.color) embed.setColor(this.template.color);
            if (this.template.fields.length > 0 && embed.fields.length > 0) embed.fields = [...this.template.fields, ...embed.fields];
        }
        embed.setTimestamp();
        embed.setFooter(!(this.useTemplateFooter && this.template.footer) ?
            `Showing page [${this.currentPage + 1}/${this.pages.length}]` :
            this.template.footer.text,
        );
        return embed;
    }

};

module.exports = Paginator;