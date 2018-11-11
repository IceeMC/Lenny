const { PermissionLevels } = require("klasa");
const constants = require("../utils/Constants.js");

module.exports = new PermissionLevels()
    // Anyone can use
    .add(0, () => true)
    // Beta testers
    .add(1, (client, message) => {
        const guild = client.guilds.get(constants.guild);
        const role = guild ? guild.roles.get(constants.roles.beta) : null;
        if (!guild || !role) return false;
        return client.config.developers.includes(message.author.id) ? true : message.member.roles.has(role.id);
    }, { fetch: true, break: true })
    // Premium members
    .add(2, (client, message) => {
        const guild = client.guilds.get(constants.guild);
        const role = guild ? guild.roles.get(constants.roles.premium) : null;
        if (!guild || !role) return false;
        return client.config.developers.includes(message.author.id) ? true : message.member.roles.has(role.id);
    }, { fetch: true, break: true })
    // Mods
    .add(6, (_, message) => message.guild && message.member.permissions.has("KICK_MEMBERS"))
    // Admin
    .add(7, (_, message) => message.guild && message.member.permissions.has("ADMINISTRATOR"), { fetch: true })
    // Guild Owner
    .add(8, (_, message) => message.guild && message.member === message.guild.owner, { fetch: true })
    // Bot Owner
    .add(9, (client, message) => client.config.developers.includes(message.author.id), { break: true })
    .add(10, (client, message) => client.config.developers.includes(message.author.id));