const { Builder } = require("breadtags");

const highestRole = new Builder()
    .setType(["highestrole", "myhighestrole"])
    .setDescription("Returns the users highest role.")
    .hasAction(false)
    .setProcess(ctx => ctx.member.roles.highest.name);

const hoistRole = new Builder()
    .setType(["hoistrole", "myhoistrole"])
    .setDescription("Returns the users highest hoisted role.")
    .hasAction(false)
    .setProcess(ctx => ctx.member.roles.hoist.name);

const colorRole = new Builder()
    .setType(["coloredrole", "colorrole", "mycolorrole", "mycoloredrole"])
    .setDescription("Returns the users highest colored role.")
    .hasAction(false)
    .setProcess(ctx => ctx.member.roles.color.name);

module.exports = [highestRole, hoistRole, colorRole];