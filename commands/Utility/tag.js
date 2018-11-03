const { Command, Timestamp, util: { clean } } = require("klasa");
const { MessageEmbed }  = require("discord.js");
const { Parser } = require("breadtags");
const customtags = require("../../utils/customtags.js");

class Tag extends Command {

    constructor(...args) {
        super(...args, {
            name: "tag",
            aliases: ["tagcmd", "bottag"],
            runIn: ["text"],
            description: language => language.get("COMMAND_TAG_DESCRIPTION"),
            usage: "<add|create|all|list|edit|delete|get|name:string> [params:string] [...]",
            usageDelim: " ",
            extendedHelp: message => message.language.get("COMMAND_TAG_EXTENDED_HELP")
        });
        this.ts = new Timestamp("MM/DD/YYYY");
        this.parser = new Parser();
        Parser.loadTag(customtags);
    }

    run(message, [type, ...params]) {
        if (type === "add" || type === "create")  return this.add(message, params);
        if (type === "all" || type === "list") return this.all(message);
        if (type === "edit") return this.edit(message, params);
        if (type === "delete") return this.delete(message, params[0]);
        if (type === "get") return this.get(message, params[0]);
        if (!["add", "create", "all", "edit", "delete", "get"].includes(type)) return this.get2(message, type);
    }

    async add(message, [name, ...content]) {
        if (name === undefined) throw "Please provide a tag name.";
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        if (message.guild.settings.tags.find(t => t.name === name)) throw "The tag already exists. So unoriginal...";
        if (!content.length) throw "Please provide some content for the tag. Here's an idea: dat banana boi is not a weeb.";
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
        if (name === undefined) throw "Please provide a tag name.";
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        if (message.guild.settings.tags.find(t => t.name === name)) throw "The tag already exists. So unoriginal...";
        if (!content.length) throw "Please provide some content for the tag. Here's an idea: dat banana boi is not a weeb.";
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
        if (name === undefined) throw "Please provide a tag name.";
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        if (!message.guild.settings.tags.find(t => t.name === name)) throw "The tag already exists. So unoriginal...";
        if (!content.length) throw "Please provide some content for the tag. Here's an idea: dat banana boi is not a weeb.";
        const { tags } = message.guild.settings;
        if (!tags.find(t => t.name === name)) throw "The tag was not found.";
        if (tags.find(t => t.name === name).creator !== message.author.id && !message.member.permissions.has("ADMINISTRATOR"))
            throw "Hey! That ain't your tag, and you don't have **Administrator** permissions, so back off.";
        if (!newContent.length) throw "Please provide some content for the tag.";
        const newTag = {
            name,
            content: newContent.join(" "),
            creator: message.author.id,
            creatorString: message.author.tag,
            created: this.ts.display(new Date())
        };
        await message.guild.settings.update("tags", newTag, { action: "overwrite" });
        return message.send(`Edited the tag: \`${name}\`.`);
    }

    async delete(message, name) {
        if (name === undefined) throw "Please provide a tag name.";
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        if (!message.guild.settings.tags.find(t => t.name === name)) throw "The tag does not exist.";
        if (message.guild.settings.tags.find(t => t.name === name).creator !== message.author.id && !message.member.permissions.has("ADMINISTRATOR"))
            throw "Hey! That ain't your tag, or you don't have **Administrator** permission, so back off.";
        const { tags } = message.guild.settings;
        const tag = tags.indexOf(message.guild.settings.tags.find(t => t.name === name));
        await message.guild.settings.update("tags", tag, { action: "remove" });
        return message.send(`Deleted the tag with name: \`${name}\`. Let's hope it's in a better place.`);
    }
    
    async get(message, name) {
        if (name === undefined) throw "Please provide a tag name.";
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        const tag = message.guild.settings.tags.find(t => t.name === name);
        const tagEmbed = new MessageEmbed();
        tagEmbed.setTitle(name);
        tagEmbed.setColor(this.client.utils.color);
        tagEmbed.setDescription(`
**Tag creator** -> \`${tag.creatorString}\`

**Tag creation** -> \`${tag.created}\`

**Tag content**
${tag.content}
        `);
        return message.sendEmbed(tagEmbed);
    }

    async get2(message, name, args) {
        if (name === undefined) throw "Please provide a tag name.";
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        if (!message.guild.settings.tags.find(t => t.name === name)) throw "That tag was not found... Are you trying to break the bot?";
        const tag = message.guild.settings.tags.find(t => t.name === name);
        return message.send(await this.parse(tag.content, message, args));
    }

    async parse(content, message, args) {
        return await this.parser.parse(clean(content), {
            user: message.author,
            guild: message.guild,
            channel: message.channel,
            member: message.member,
            args
        });
    }

}

module.exports = Tag;