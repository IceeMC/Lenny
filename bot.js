const { Client } = require("klasa");
const permissionLevels = require("./utils/PermissionLevels.js");
const config = require("./config.json");
const Raven = require("raven");
const RawEventStore = require("./utils/RawEventStore.js");
const Logger = require("./utils/Logger.js");
const capcon = require('capture-console');
const {
    defaultGuildSchema,
    defaultClientSchema,
    defaultUserSchema,
    defaultMemberSchema
} = require("./utils/DefaultSchemas.js");

Raven.config(config.sentry, { captureUnhandledRejections: true }).install();

class RemixBot extends Client {

    constructor() {
        super({
            pieceDefaults: { rawEvents: { enabled: true } },
            prefix: "r.",
            regexPrefix: /^((Hey|Hey )RemixBot(!|! |,|, | )|(r\.|r\. ))/i,
            commandEditing: true,
            typing: true,
            providers: { default: "PostgreSQL", postgresql: { user: config.pgUser, password: config.pgPass } },
            permissionLevels: permissionLevels,
            readyMessage: (client) => `${client.user.tag} ready with ${client.guilds.size} guilds!`,
            defaultGuildSchema,
            defaultClientSchema,
            defaultUserSchema,
            defaultMemberSchema
        });
        this.config = require("./config.json");
        this.utils = new (require("./utils/Utils.js"))(this);
        this.audioManager = null;
        this.logger = new Logger(this, "log.txt");
        this.website = null;
        this.tttGames = new Map();
        this.rawEvents = new RawEventStore(this);
        this.registerStore(this.rawEvents);
        capcon.startCapture(process.stdout, stdout => this.logger.write(stdout));
        capcon.startCapture(process.stderr, stderr => this.logger.write(stderr));
    }
 
}

Raven.context(() => new RemixBot().login(config.token));