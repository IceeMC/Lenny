const { Client } = require("klasa");

Client.use(require("klasa-member-gateway"));

module.exports.defaultGuildSchema = Client.defaultGuildSchema
    .add("welcome", (folder) => folder
        .add("enabled", "boolean", { default: false })
        .add("welcomeMessage", "string", { default: "Hello **{mention}** welcome to **{guild}**!" })
        .add("leaveMessage", "string", { default: "**{username}** has left **{guild}**." })
        .add("welcomeChannel", "textchannel")
        .add("autoRole", "role")
    )
    .add("logs", (folder) => folder
        .add("channel", "textchannel")
        .add("guild", "boolean", { default: false })
        .add("channels", "boolean", { default: false })
        .add("roles", "boolean", { default: false })
        .add("nicknames", "boolean", { default: false })
        .add("bans", "boolean", { default: false })
        .add("joins", "boolean", { default: false })
        .add("leaves", "boolean", { default: false })
        .add("warns", "boolean", { default: false })
        .add("messages", "boolean", { default: false })
    )
    .add("levelsEnabled", "boolean", { default: false })
    .add("tags", "any", { array: true })
    .add("starboard", (folder) => folder
        .add("limit", "integer", { default: 1 }) 
        .add("channel", "textchannel"))
    .add("automod", (folder) => folder
        .add("invites", "boolean", { default: false })
        .add("spamProtection", folder => folder
            .add("enabled", "boolean", { default: false })
            .add("limit", "integer", { default: 5 })
            .add("punishment", "string", { default: "mute" })
        )
    );

module.exports.defaultClientSchema = Client.defaultClientSchema
    .add("latestRestart", "any");

module.exports.defaultUserSchema = Client.defaultUserSchema
    .add("afk", "any");

module.exports.defaultMemberSchema = Client.defaultMemberSchema
    .add("coins", "integer", { default: 100 })
    .add("level", "integer", { default: 0 });