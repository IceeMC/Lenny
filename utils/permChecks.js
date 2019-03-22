const PermChecks = require("../framework/PermChecks.js");
const constants = require("./Constants.js");

module.exports = new PermChecks()
    // Anyone can use
    .add(0, () => true)
//     // Beta testers
//     .add(2, (client, message) => {
//         const guild = client.guilds.get(constants.guild);
//         const role = guild ? guild.roles.get(constants.roles.beta) : null;
//         if (!guild || !role) return false;
//         return client.config.developers.includes(message.author.id) || message.member.roles.has(role.id);
//     })
//     // Premium members
//     .add(3, (client, message) => {
//         const guild = client.guilds.get(constants.guild);
//         const role = guild ? guild.roles.get(constants.roles.premium) : null;
//         if (!guild || !role) return false;
//         return client.config.developers.includes(message.author.id) || message.member.roles.has(role.id);
//     })
    // Guild Managers
    .add(5, (_, message) => message.guild && message.member.permissions.has("MANAGE_GUILD"))
    // Moderator
    .add(6, (_, message) => message.guild && message.member.permissions.has(["BAN_MEMBERS", "KICK_MEMBERS"]))
    // Administrator
    .add(7, (_, message) => message.guild && message.member.permissions.has("ADMINISTRATOR"))
    // Guild Owner
    .add(8, (_, message) => message.guild && message.member === message.guild.owner)
    // Bot Owner
    .add(10, (client, message) => client.config.developers.includes(message.author.id), { sendError: false });
