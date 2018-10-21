const { Client } = require("klasa");
const permissionLevels = require("./utils/PermissionLevels.js");
const config = require("./config.json");
const Raven = require("raven");
const RawEventStore = require("./utils/RawEventStore.js");
const Logger = require("./utils/Logger.js");
const replacer = /\[(..m|..\;..m|m)/g;
const captureConsole = require("capture-console");
const randomHexColor = require("random-hex-color");
const {
    defaultGuildSchema,
    defaultClientSchema,
    defaultUserSchema,
    defaultMemberSchema
} = require("./utils/DefaultSchemas.js");
const { loadavg } = require("os");

Raven.config(config.sentry, { captureUnhandledRejections: true }).install();

class ChatNoirClient extends Client {

    constructor() {
        super({
            pieceDefaults: { rawEvents: { enabled: true } },
            prefix: "cn.",
            regexPrefix: /^((Hey|Hey )(Chat Noir|ChatNoir)(!|! |,|, | )|(cn\.|cn\. ))/i,
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
        // Set ChartJS options
        require("chart.js").defaults.global.defaultFontColor = "#FFFFFF";
        require("chart.js").defaults.global.showLines = false;
        this.config = require("./config.json");
        this.utils = new (require("./utils/Utils.js"))(this);
        this.audioManager = null;
        this.logger = new Logger(this, "log.txt");
        this.website = null;
        this.tttGames = new Map();
        this.rawEvents = new RawEventStore(this);
        this.registerStore(this.rawEvents);
        captureConsole.startCapture(process.stdout, stdout => this.logger.write(stdout.replace(replacer, "")));
        captureConsole.startCapture(process.stderr, stderr => this.logger.write(stderr.replace(replacer, "")));
        const usage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const color = randomHexColor();
        this.memoryCaptures = [{ usage, color }];
        const cpuUsage = loadavg().map(avg => avg * 10000 / 1000).reduce((p, v) => p + v).toFixed(2);
        const randColor = randomHexColor();
        this.cpuCaptures = [{ usage: cpuUsage, color: randColor }];
        this.spotifyToken = null;
    }
 
}

Raven.context(() => new ChatNoirClient().login(config.token));