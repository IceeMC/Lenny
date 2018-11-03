const { Client, Schema } = require("klasa");
const permissionLevels = require("./utils/PermissionLevels.js");
const config = require("./config.json");
const Raven = require("raven");
const RawEventStore = require("./utils/RawEventStore.js");
const Logger = require("./utils/Logger.js");
// const replacer = /\[(..m|..\;..m|m)/g;
const CatLoggr = require("cat-loggr");
const captureConsole = require("capture-console");
const randomHexColor = require("random-hex-color");
const {
    defaultGuildSchema,
    defaultClientSchema,
    defaultUserSchema,
    defaultMemberSchema
} = require("./utils/DefaultSchemas.js");
const { loadavg } = require("os");
const BananAPI = require("bananapi");

Raven.config(config.sentry, {
    captureUnhandledRejections: true
}).install();

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
        // Init custom console
        this.console = new CatLoggr()
            .setLevels([
                { name: "wtf", color: CatLoggr._chalk.black.bgRed },
                { name: "log", color: CatLoggr._chalk.black.bgBlue },
                { name: "warn", color: CatLoggr._chalk.black.bgYellow },
            ]);
        // Set ChartJS options
        require("chart.js").defaults.global.defaultFontColor = "#FFFFFF";
        require("chart.js").defaults.global.showLines = false;
        this.config = require("./config.json");
        this.utils = new (require("./utils/Utils.js"))(this);
        this.audioManager = null;
        this.logger = new Logger(this, "log.txt");
        this.website = null;
        this.tttGames = new Map();
        this.unoGames = new Map();
        this.rawEvents = new RawEventStore(this);
        this.registerStore(this.rawEvents);
        captureConsole.startCapture(process.stdout, stdout => this.logger.write(stdout));
        captureConsole.startCapture(process.stderr, stderr => this.logger.write(stderr));
        const usage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const color = randomHexColor();
        this.memoryCaptures = [{ usage, color }];
        const cpuUsage = loadavg().map(avg => avg * 10000 / 1000).reduce((p, v) => p + v).toFixed(2);
        const randColor = randomHexColor();
        this.cpuCaptures = [{ usage: cpuUsage, color: randColor }];
        this.spotifyToken = null;
        this.bananapi = new BananAPI.Client({ token: config.bananapi });
    }

}

const client = new ChatNoirClient();

client.gateways.register("unoSaves", {
    provider: "PostgreSQL",
    schema: new Schema()
        .add("players", "any", { default: [] })
        .add("cards", "any", { default: [] })
        .add("deadCards", "any", { default: [] })
        .add("rankings", "any", { default: [] })
        .add("msg", "any")
        .add("drawnCards", "integer", { default: 0 })
        .add("started", "boolean", { default: false })
        .add("startedAt", "integer", { default: Date.now() })
        .add("reversed", "boolean", { default: false })
});

Raven.context(() => client.login(config.token));