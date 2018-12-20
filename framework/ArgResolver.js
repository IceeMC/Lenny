const { GuildMember, User, TextChannel, VoiceChannel, Role } = require("discord.js");

// Deprecated as of 12/7/18
class ArgResolver {

    static member(message, query, optional = false) {
        if (query instanceof GuildMember) return { queryLen: query.user.tag.length, member: query };
        if (!query && optional) throw "A member must be provided.";
        if (query.match(/.{16,18}/)) {
            const member = message.guild.members.get(query);
            if (!member) throw "Invalid member. To find a user the query must be a valid id, username, or username#discriminator.";
            return { queryLen: query.length, member };
        }
        if (query.match(/(\w*)#([0-9]{4})/)) {
            const member = message.guild.members.find(member => member.user.tag === query);
            if (!member) throw "Invalid member. To find a user the query must be a valid id, username, or username#discriminator.";
            return { queryLen: query.length, member };
        }
        const members = message.guild.members.filter(member => member.user.username === query);
        if (!members.size) throw "Invalid member. To find a user the query must be a valid id, username, or username#discriminator.";
        if (members.size > 1) throw `Found multiple members with that username ${members.map(m => `\"${m.user.tag}\"`).join(", ")}\". Be more specific.`;
        return { queryLen: query.length, member: members.first() };
    }

    static async user(message, query, optional = false) {
        if (query instanceof User) return { queryLen: query.tag.length, user: query };
        if (!query && optional) throw "A user must be provided.";
        if (query.match(/.{16,18}/)) {
            const user = message.client.users.get(query) || await message.client.users.fetch(query);
            if (!user) throw "Invalid user. To find a user the query must be a valid id, username, or username#discriminator.";
            return { queryLen: query.length, user };
        }
        if (query.match(/(\w*)#([0-9]{4})/)) {
            const user = message.client.users.find(user => user.tag === query);
            if (!user) throw "Invalid user. To find a user the query must be a valid id, username, or username#discriminator.";
            return { queryLen: query.length, user };
        }
        const users = message.client.users.filter(user => user.username === query);
        if (!users.size) throw "Invalid user. To find a user the query must be a valid id, username, or username#discriminator.";
        if (users.size > 1) throw `Found multiple users with that username ${users.map(m => `\"${m.user.tag}\"`).join(", ")}\". Be more specific.`;
        return { queryLen: query.length, user };
    }

    static textChannel(message, query, optional = false) {
        if (query instanceof TextChannel) return { queryLen: query.name.length, channel: query };
        if (!query && !optional) throw "A text channel must be provided. Remember that spaces must be replace with a dash.";
        if (query.match(/.{16,18}/)) {
            const channel = message.guild.channels.filter(c => c.type === "text").get(query);
            if (!channel) throw "Invalid text channel. To find a text channel the query must be a valid id, name, or mention.";
            return { queryLen: query.length, channel };
        }
        const channel = message.mentions.channels.first() || message.guild.channels.find(c => c.name === query);
        if (!channel || channel.type !== "text")
            throw "Invalid text channel. To find a text channel the query must be a valid id, name, or mention.";
        return { queryLen: query.length, channel };
    }

    static voiceChannel(message, query, optional = false) {
        if (query instanceof VoiceChannel) return { queryLen: query.name.length, channel: query };
        if (!query && !optional) throw "A voice channel must be provided.";
        if (query.match(/.{16,18}/)) {
            const channel = message.guild.channels.filter(c => c.type === "voice").get(query);
            if (!channel) throw "Invalid voice channel. To find a voice channel the query must be a valid id, or name.";
            return { queryLen: query.length, channel };
        }
        const channel = message.mentions.channels.first() || message.guild.channels.find(c => c.name === query);
        if (!channel || channel.type !== "voice")
            throw "Invalid voice text channel. To find a text channel the query must be a valid id, or name.";
        return { queryLen: query.length, channel };
    }

    static role(message, query, optional = false) {
        if (query instanceof Role) return { queryLen: query.name.length, role: query };
        if (!query && !optional) throw "A role must be provided.";
        if (query.match(/.{16,18}/)) {
            const role = message.guild.roles.find(r => r.id === query);
            if (!role) throw "Invalid role. To find a role the query must be a valid id, name, or mention (not recommended).";
            return { queryLen: query.length, role };
        }
        if (message.mentions.roles.size > 0) return message.mentions.roles.first();
        const role = message.guild.roles.filter(r => r.name === query).first();
        if (!role) throw "Invalid role. To find a role the query must be a valid id, name, or mention (not recommended).";
        return { queryLen: query.length, role };
    }

    static int(number, min, max, optional = false) {
        if (!number && !optional) throw "A number must be provided.";
        const parsed = isNaN(number) ? null : parseInt(number) || null;
        if (!parsed) throw "Please provide a number (thats valid.)";
        if (!min) min = 1;
        if (!max) max = parsed;
        if (parsed < min || parsed > max) throw `number must be greater than than ${min} and less than ${max}.`;
        return parsed;
    }

    static string(query, min, max, optional = false) {
        if (!query && !optional) throw "A query must be provided.";
        if (!min) min = 0;
        if (!max) max = query.length;
        if (query.length < min || query.length > max) throw `query must be greater than ${min} characters and less than ${max} characters.`;
        return query;
    }

    static command(message, query) {
        if (!query) return null;
        const commands = message.client.storeManager.getStore("commands");
        const aliases = commands.aliases;
        const cmd = commands.files.get(query) || aliases.get(query);
        if (!cmd) throw `Command \`${query}\` was not found.`;
        return cmd;
    }

    static fromStore(message, query) {
        if (!query) throw "A query must be provided.";
        const store = message.client.storeManager.find(store => store.files.has(query));
        const keys = message.client.storeManager.keys().map(k => `\`${k.endsWith("s") ? k.slice(0, k.length - 1) : k}\``);
        if (!store) throw `Invalid query. Select from the following: ${keys.join(", ")}`;
        return store.files.get(query);
    }

    static color(color) {
        if (!color) throw "A color must be provided.";
        const colorMatch = /(?:0x|#)?([A-Fa-f0-9]{6})/.exec(color);
        if (!colorMatch) throw "color must be a valid hexadecimal value. Eg: `#FFFFFF`";
        return colorMatch[1];
    }

}

module.exports = ArgResolver;