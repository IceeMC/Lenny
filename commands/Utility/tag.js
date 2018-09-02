const { Command, Timestamp } = require("klasa");
const { MessageEmbed }  = require("discord.js");

class Tag extends Command {

    constructor(...args) {
        super(...args, {
            name: "tag",
            aliases: ["tagcmd", "bottag"],
            runIn: ["text"],
            description: language => language.get("COMMAND_TAG_DESCRIPTION"),
            usage: "<add|create|all|edit|delete|get|name:string> [params:string] [...]",
            usageDelim: " ",
            extendedHelp: message => message.language.get("COMMAND_TAG_EXTENDED_HELP")
        });
        this.ts = new Timestamp("MM/DD/YYYY");
    }

    run(message, [type, ...params]) {
        if (type === "add") return this.add(message, params);
        if (type === "create") return this.add(message, params);
        if (type === "all") return this.all(message);
        if (type === "edit") return this.edit(message, params);
        if (type === "delete") return this.delete(message, params[0]);
        if (type === "get") return this.get(message, params[0]);
        if (!["add", "create", "all", "edit", "delete", "get"].includes(type)) return this.get2(message, type);
    }

    async add(message, [name, ...content]) {
        if (name === undefined) return message.send("Please provide a tag name.");
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) return message.send("The tag name is reserved. Man, that would screw me up.");
        if (message.guild.settings.tags.find(t => t.name === name)) return message.send("The tag already exists. So unoriginal...");
        if (!content.length) return message.send("Please provide some content for the tag. Here's an idea: dat banana boi is not a weeb.");
        const newTag = {
            name,
            content: content.join(" "),
            creator: message.author.id,
            creatorString: message.author.tag,
            created: this.ts.display(new Date())
        };
        await message.guild.settings.update("tags", newTag, { action: "add" });
        return message.send(`Created the tag **\`${name}\`** for the server.`);
    }

    async create(message, [name, ...content]) {
        if (name === undefined) return message.send("Please provide a tag name.");
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) return message.send("The tag name is reserved.");
        if (message.guild.settings.tags.find(t => t.name === name)) return message.send("The tag already exists. So unoriginal...");
        if (!content.length) return message.send("Please provide some content for the tag. Here's an idea: dat banana boi is not a weeb.");
        const newTag = {
            name,
            content: content.join(" "),
            creator: message.author.id,
            creatorString: message.author.tag,
            created: this.ts.display(new Date())
        };
        await message.guild.settings.update("tags", newTag, { action: "add" });
        return message.send(`Created the tag **\`${name}\`** for the server.`);
    }

    async all(message) {
        const { tags } = message.guild.settings;
        const allTags = new MessageEmbed();
        allTags.setColor(0xFFFFFF);
        allTags.setTitle("Current guild tags");
        let index = 0;
        if (tags.length < 1) allTags.setDescription("This server has no tags. Be the one to break the silence.");
        else allTags.setDescription(tags.map(tag => `\`${++index}\` -> ${tag.name} -> **${tag.creatorString}**`).join("\n"));
        return message.sendEmbed(allTags);
    }

    async edit(message, [name, ...newContent]) {
        if (name === undefined) return message.send("Please provide a tag name.");
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) return message.send("The tag name is reserved. Man, that would screw me up.");
        const { tags } = message.guild.settings;
        if (!tags.find(t => t.name === name)) return message.send("The tag was not found.");
        if (tags.find(t => t.name === name).creator !== message.author.id && !message.member.permissions.has("ADMINISTRATOR"))
            return message.send("Hey! That ain't your tag, and you don't have **Administrator** permissions, so back off.")
        if (!newContent.length) return message.send("Please provide some content for the tag.");
        const newTag = {
            name,
            content: newContent.join(" "),
            creator: message.author.id,
            creatorString: message.author.tag,
            created: this.ts.display(new Date())
        };
        await message.guild.settings.update("tags", newTag, { action: "overwrite" });
        return message.send(`Edited the tag with name: \`${name}\`.`);
    }

    async delete(message, name) {
        if (name === undefined) return message.send("Please provide a tag name.");
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) return message.send("The tag name is reserved. Man, that would screw me up.");
        if (!message.guild.settings.tags.find(t => t.name === name)) return message.send("The tag was not found. Create one or move on.");
        if (message.guild.settings.tags.find(t => t.name === name).creator !== message.author.id && !message.member.permissions.has("ADMINISTRATOR"))
            return message.send("Hey! That ain't your tag, or you don't have **Administrator** permission, so back off.")
        const { tags } = message.guild.settings;
        const tag = tags.indexOf(message.guild.settings.tags.find(t => t.name === name));
        await message.guild.settings.update("tags", tag, { action: "remove" });
        return message.send(`Deleted the tag with name: \`${name}\`. Let's hope it's in a better place.`);
    }
    
    async get(message, name) {
        if (name === undefined) return message.send("Please provide a tag name.");
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) return message.send("The tag name is reserved.");
        if (!message.guild.settings.tags.find(t => t.name === name)) return message.send("Invalid tag name passed");
        const tag = message.guild.settings.tags.find(t => t.name === name);
        const tagEmbed = new MessageEmbed();
        tagEmbed.setTitle(name);
        tagEmbed.setColor(0xFFFFFF);
        tagEmbed.setDescription(`
**Tag creator** -> \`${tag.creatorString}\`

**Tag creation** -> \`${tag.created}\`

**Tag content**
${tag.content}
        `);
        return message.sendEmbed(tagEmbed);
    }

    async get2(message, name) {
        if (name === undefined) return message.send("Please provide a tag name.");
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) return message.send("The tag name is reserved.");
        if (!message.guild.settings.tags.find(t => t.name === name)) return message.send("Invalid tag name passed");
        const tag = message.guild.settings.tags.find(t => t.name === name);
        return message.send(tag.content.replace(/@/g, "@\u200b"));
    }

}

module.exports = Tag;