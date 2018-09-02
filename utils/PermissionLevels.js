const { PermissionLevels } = require("klasa");

module.exports = new PermissionLevels()
    // Anyone can use
    .add(0, () => true)
    // Mods
    .add(6, (client, message) => message.guild && message.member.permissions.has("KICK_MEMBERS"))
    // Admin
    .add(7, (client, message) => message.guild && message.member.permissions.has('ADMINISTRATOR'), { fetch: true })
    // Guild Owner
    .add(8, (client, message) => message.guild && message.member === message.guild.owner, { fetch: true })
    // Bot Owner
    .add(9, (client, message) => client.config.developers.includes(message.author.id), { break: true })
    .add(10, (client, message) => client.config.developers.includes(message.author.id));