const { Argument, util: { regExpEsc } } = require("klasa");
const { Role } = require("discord.js");
const roleRegex = Argument.regex.role;

function resolveRole(query, guild) {
    if (query instanceof Role) return guild.roles.has(query.id) ? query : null;
    if (typeof query === 'string' && roleRegex.test(query)) return guild.roles.get(roleRegex.exec(query)[1]);
    return null;
}

class RoleName extends Argument {

    async run(arg, possible, message) {
        if (!message.guild) return this.role(arg, possible, message);
        const resolved = resolveRole(arg, message.guild);
        if (resolved) return resolved;

        const roleResults = [];
        let type = "";
        const roleNameMatch = new RegExp(regExpEsc(arg), "i");
        
        for (const role of message.guild.roles.values()) { if (roleNameMatch.test(role.name)) roleResults.push(role); }

        if (roleResults.length > 0) {
            const roles = roleResults.filter(() => roleNameMatch.test(arg));
            type = roles.length < 1 ? "MATCH" : "MULTIPLE";
        } else type = "INVALID";

        switch (type) {
            case "MATCH": return roleResults[0];
            case "MULTIPLE": return this.waitForSelection(message, roleResults);
            case "INVALID": throw message.language.get("RESOLVER_INVALID_ROLENAME", possible);
        }
   }

    async waitForSelection(message, results) {
        const result = await message.prompt(message.language.get("RESOLVER_MULTIPLE_ROLES", results));
        if (!results.find(res => res.name === result.cleanContent)) {
            message.channel.send(message.language.get("RESOLVER_INVALID_ROLE_CHOICE", result.cleanContent, results));
            return this.waitForSelection(message, results);
        }
        return results.find(res => res.name === result.cleanContent);
    }

}

module.exports = RoleName;