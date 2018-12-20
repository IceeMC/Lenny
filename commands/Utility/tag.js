const Command = require("../../framework/Command.js");
const { MessageEmbed }  = require("discord.js");
const { Parser } = require("breadtags");
const customtags = require("../../utils/customtags.js");
const moment = require("moment");

class Tag extends Command {

    constructor(...args) {
        super(...args, {
            name: "tag",
            aliases: ["tagcmd", "bottag"],
            runIn: ["text"],
            description: language => language.get("COMMAND_TAG_DESCRIPTION"),
            extendedHelp: language => language.get("COMMAND_TAG_EXTENDED_HELP"),
            usage: "<type> [args:string::all]",
        });
        this.parser = new Parser();
        customtags.map(Parser.loadTag.bind(this));
    }

    run(message, [type, ...args]) {
        const types = ["add", "create", "all", "list", "edit", "delete", "get", "tagName"];
        if (!type) throw message.language.get("BAD_SUB_CMD_TYPE", types);
        if (type === "add" || type === "create")  return this.add(message, args);
        if (type === "all" || type === "list") return this.all(message);
        if (type === "edit") return this.edit(message, args);
        if (type === "delete") return this.delete(message, args[0]);
        if (type === "get") return this.get(message, args[0]);
        if (!["add", "create", "all", "edit", "delete", "get"].includes(type)) return this.get2(message, type);
        throw message.language.get("BAD_SUB_CMD_TYPE", types);
    }

    async add(message, [name, ...content]) {
        if (!name) throw "Please provide a tag name.";
        name = this.client.clean(message, name);
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        if (message.guild.config.tags.find(t => t.name === name)) throw "The tag already exists. So unoriginal...";
        if (!content.length) throw "Please provide some content for the tag.";
        const newTag = {
            name,
            content: this.client.clean(message, content.join("")),
            creator: message.author.id,
            creatorString: message.author.tag,
            created: moment(new Date()).format("MM/DD/YYYY HH:MM:SS")
        };
        message.guild.config.tags.push(newTag);
        await message.guild.updateConfig({ tags: message.guild.config.tags });
        return message.send(`Created the tag **\`${name}\`** for the server.`);
    }

    async all(message) {
        const { tags } = message.guild.config;
        const allTags = new MessageEmbed();
        allTags.setColor(0xFFFFFF);
        allTags.setTitle("Current guild tags");
        allTags.setDescription(tags.length < 1 ? 
            "This server has no tags. Be the one to break the silence." :
            tags.map((tag, index) => `\`${index++}\` -> ${this.client.clean(message, tag.name)} -> **${tag.creatorString}**`).join("\n"));
        return message.send(allTags);
    }

    async edit(message, [name, ...newContent]) {
        if (!name) throw "Please provide a tag name.";
        name = this.client.clean(message, name);
        if (!newContent.length) throw "Please provide some content for the tag.";
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        const { tags } = message.guild.config;
        const tag = tags.find(t => t.name === name);
        if (!tag) throw "The tag was not found.";
        if (tag.creator !== message.author.id && !message.member.permissions.has("ADMINISTRATOR"))
            throw "Hey! That ain't your tag, and you don't have **Administrator** permissions, so back off.";
        if (tag.content === newContent.join(""))
            throw "Hey! The new content can't equal the old content.";
        const content = this.client.clean(message, newContent.join(""));
        const newTag = { ...tag, content };
        // Replace old tag index
        tags[tags.indexOf(tag)] = newTag;
        // Update
        await message.guild.updateConfig({ tags });
        return message.send(`Successfully edited tag \`${name}\`. New content: \`${content}\``);
    }

    async delete(message, name) {
        if (!name) throw "Please provide a tag name.";
        name = this.client.clean(message, name);
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        const { tags } = message.guild.config;
        const tag = tags.find(t => t.name === name);
        if (!tag) throw "The tag does not exist.";
        if (tag.creator !== message.author.id && !message.member.permissions.has("ADMINISTRATOR"))
            throw "Hey! That ain't your tag, or you don't have **Administrator** permission, so back off.";
        tags.splice(tags.indexOf(tag), 1);
        await message.guild.updateConfig({ tags });
        return message.send(`Deleted the tag with name: \`${name}\`. Let's hope it's in a better place.`);
    }
    
    async get(message, name) {
        if (!name) throw "Please provide a tag name.";
        name = this.client.clean(message, name);
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        const tag = message.guild.config.tags.find(t => t.name === name);
        if (!tag) throw "That tag was not found. Are you trying to break the bot?";
        const tagEmbed = new MessageEmbed();
        tagEmbed.setTitle(name);
        tagEmbed.setColor(this.client.utils.color);
        tagEmbed.setDescription(`
**Tag creator** -> \`${tag.creatorString} (${tag.creator})\`

**Tag creation** -> \`${tag.created}\`

**Tag content**
${tag.content}
        `);
        return message.send(tagEmbed);
    }

    async get2(message, name, args) {
        if (!name) throw "Please provide a tag name.";
        name = this.client.clean(message, name);
        if (["add", "create", "all", "edit", "delete", "get"].includes(name)) throw "The tag name is reserved. Man, that would screw me up.";
        const tag = message.guild.config.tags.find(t => t.name === name);
        if (!tag) throw "That tag was not found. Are you trying to break the bot?";
        return message.send(await this.parse(tag.content, message, args));
    }

    async parse(content, message, args) {
        return await this.parser.parse(this.client.clean(message, content), {
            user: message.author,
            guild: message.guild,
            channel: message.channel,
            member: message.member,
            args
        });
    }

}

module.exports = Tag;