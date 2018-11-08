const { Argument, util: { regExpEsc } } = require("klasa");
const { GuildMember, User } = require("discord.js");

function resolveMember(query, guild) {
    if (query instanceof GuildMember) return query;    
	if (query instanceof User) return guild.members.fetch(query);
    if (typeof query === "string") {
        if (Argument.regex.userOrMember.test(query)) {
            const res = guild.members.find(member => member.user.id === Argument.regex.userOrMember.exec(query)[1]);
            return res || null;            
        }
        if (/\w{1,32}#\d{4}/.test(query)) {
            const res = guild.members.find(member => member.user.tag.toLowerCase() === query.toLowerCase());
            return res || null;
        }
    }
    return null;
  }

class MemberName extends Argument {

    async run(arg, possible, message) {
		if (!message.guild) throw "This command can only be used inside a guild.";
        const resolved = resolveMember(arg, message.guild);
        if (resolved !== null) return resolved;
    
        let memberResults = [];
        let matches;
        const memberNameMatch = new RegExp(regExpEsc(arg), "i");
        
        for (const member of message.guild.members.values()) { if (memberNameMatch.test(member.user.username)) memberResults.push(member); }

        if (memberResults.length > 0) {
            const word = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
            const members = memberResults.filter(member => word.test(member.user.username));
            matches = members.length > 0 ? members : memberResults;
        } else matches = memberResults;

        switch (matches.length) {
            case 0: throw message.language.get("RESOLVER_INVALID_MEMBERNAME", possible);
            case 1: return matches[0];
            default: return this.waitForSelection(message, matches);
        }
   }

    async waitForSelection(message, results) {
        const result = await message.prompt(message.language.get("RESOLVER_MULTIPLE_MEMBERS", results));
        if (result.content.match(/(cancel|quit|stop)/)) {
            message.channel.send("Stopped!").then(m => m.delete(5000));
            return null;
        }
        if (!results.find(res => res.user.username === result.cleanContent)) {
            message.channel.send(message.language.get("RESOLVER_INVALID_MEMBER_CHOICE", result.cleanContent, results));
            return this.waitForSelection(message, results);
        }
        return results.find(res => res.user.username === result.cleanContent);
    }

}

module.exports = MemberName;