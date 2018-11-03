const { Builder } = require("breadtags");

const highestRole = new Builder()
    .setType(["highestrole", "myhighestrole"])
    .setDescription("Returns the users highest role")
    .hasAction(false)
    .setProcess(ctx => ctx.member.roles.highest.name);

const hoistRole = new Builder()
    .setType(["hoistrole", "hoistrole"])
    .setDescription("Returns the users highest hoisted role.")
    .hasAction(false)
    .setProcess(ctx => ctx.member.roles.hoist.name);



module.exports = [highestRole];