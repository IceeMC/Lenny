const { Client } = require("klasa");
const permissionLevels = require("./utils/PermissionLevels.js");
const config = require("./config.json");
const Raven = require("raven");
const RawEventStore = require("./utils/RawEventStore.js");
const Logger = require("./utils/Logger.js");
const capcon = require('capture-console');

Raven.config(config.sentry, { captureUnhandledRejections: true }).install();

class RemixBot extends Client {

    constructor(options) {
        super({
            pieceDefaults: { rawEvents: { enabled: true } },
            prefix: "r.",
            regexPrefix: /^((Hey|Hey )RemixBot(!|! |,|, | )|(r\.|r\. ))/i,
            commandEditing: true,
            commandLogging: true,
            typing: true,
            providers: { default: "MongoProvider" },
            permissionLevels: permissionLevels,
            readyMessage: (client) => `${client.user.tag} ready with ${client.guilds.size} guilds!`
        });
        this.config = require("./config.json");
        this.utils = new (require("./utils/Utils.js"))(this);
        this.audioManager = null;
        this.logger = new Logger(this, "log.txt");
        this.website = null;
        this.tttGames = new Map();
        this.rawEvents = new RawEventStore(this);
        this.registerStore(this.rawEvents);
        capcon.startCapture(process.stdout, (stdout) => {
            this.logger.write(stdout);
        });
        capcon.startCapture(process.stderr, (stdout) => {
            this.logger.write(stdout);
        });
    }

    schemaCheck() {
        const obj = { added: 0, notAdded: 0 };
        RemixBot.defaultGuildSchema
            .add("welcome", (folder) => folder
                .add("welcomeMessage", "string", { default: "Hello **{mention}** welcome to **{guild}**!" })
                .add("leaveMessage", "string", { default: "**{username}** has left **{guild}**." })
                .add("welcomeChannel", "textchannel")
                .add("autoRole", "role")
            )
            .add("logs", (folder) => folder
                .add("channel", "textchannel")
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
                .add("cache", "any", { array: true })
                .add("limit", "integer", { default: 1 }) 
                .add("channel", "textchannel")
            )
            .add("automod", (folder) => folder
                .add("invites", "boolean", { default: false })
                .add("spamProtection", folder => folder
                    .add("enabled", "boolean", { default: false })
                    .add("limit", "integer", { default: 5 })
                    .add("punishment", "string", { default: "mute" })
                )
            );
        RemixBot.defaultClientSchema
            .add("latestRestart", "any")
        RemixBot.defaultUserSchema
            .add("inRelationShip", "boolean", { default: false })
            .add("marriedTo", "user")
            .add("dating", "boolean", { default: false })
            .add("coins", "integer", { default: 50 })
            .add("level", "integer", { default: 1 })
            .add("afk", "any")
        return this;
    }
 
}

Raven.context(() => new RemixBot().schemaCheck().login(config.token));