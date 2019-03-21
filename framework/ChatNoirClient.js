const { Client, Permissions } = require("discord.js");
const config = require("../config.json");
const StoreManager = require("../framework/StoreManager.js");
const stores = require("fs").readdirSync(`${process.cwd()}/framework/stores`);
const permChecks = require("../utils/permChecks");
const CatLoggr = require("cat-loggr");
const Stopwatch = require("./Stopwatch.js");
const Database = require("./Database.js");
const { sep } = require("path");

class ChatNoirClient extends Client {

    constructor(options) {
        super(options);
        // Console
        this.console = new CatLoggr()
            .setLevels([
                { name: "wtf", color: CatLoggr._chalk.black.bgRed },
                { name: "log", color: CatLoggr._chalk.black.bgBlue },
                { name: "warn", color: CatLoggr._chalk.black.bgYellow },
            ]);
        // Database instance (null at first)
        this.db = null;
        // More defining
        // Define config secretly
        Object.defineProperty(this, "config", { value: config });
        this.utils = new (require("../utils/Utils.js"))(this);
        this.audioManager = null;
        this.website = null;
        this.tttGames = new Map();
        this.unoGames = new Map();
        // Custom stuff
        this.storeManager = new StoreManager(this);
        // Perm checks
        this.permChecks = permChecks;
        // Internal listeners
        process.on("unhandledRejection", error => this.emit("unhandledRejection", error));
        process.on("uncaughtException", error => this.emit("error", error));
    }

    clean(message, text = message.content) {
        return text
            .replace(/@(everyone|here)/g, "@\u200b$1")
            .replace(/<@!?([0-9]{16,18})>/g, (m, id) => {
                if (["dm", "group"].includes(message.channel.type)) return this.users.has(id) ? `@${this.users.get(id).username}` : m;
                const member = message.guild.members.get(id);
                return member ? `@${member.displayName}` : m;
            })
            .replace(/<#([0-9]{16,18})>/g, (m, id) => {
                const channel = this.channels.get(id);
                return channel ? `#${channel.name}` : m;
            })
            .replace(/<@&([0-9]{16,18})>/g, (m, id) => {
                const role = message.guild.roles.get(id);
                return role ? `@${role.name}` : m;
            });
    }

    get invite() {
        const totalCommandPerms = this.storeManager.getStore("commands").values().reduce((arr, cmd) => [...arr, ...cmd.perms], []);
        const { bitfield } = new Permissions(totalCommandPerms);
        return `https://discordapp.com/oauth2/authorize?client_id=${this.user.id}&permissions=${bitfield}&scope=bot`;
    }

    async login() {
        const stopwatch = (new Stopwatch(2)).start();
        const db = new Database(this);
        await db.start();
        this.db = db;
        this.console.log("Connected to MongoDB!");
        // Start caching configs, and members for "sync" operations.
        const configCacheSW = (new Stopwatch(2)).start();
        const memberCacheSW = (new Stopwatch(2)).start();
        const userCacheSW = (new Stopwatch(2)).start();
        await this.db.cacheConfigs();
        this.console.log(`Loaded ${Object.keys(this.db._cache.configs).length} configs into memory in ${configCacheSW.stop()}ms.`);
        await this.db.cacheMembers();
        this.console.log(`Loaded ${Object.keys(this.db._cache.members).length} members into memory in ${memberCacheSW.stop()}ms.`);
        await this.db.cacheUsers();
        this.console.log(`Loaded ${Object.keys(this.db._cache.users).length} users into memory in ${userCacheSW.stop()}ms.`);
        await Promise.all(stores.map(async n => {
            const path = `${process.cwd()}${sep}framework${sep}stores${sep}${n}`;
            await this.storeManager.addStore(new (require(path))(this, n.slice(0, -3), path)).then(async s => {
                await s.setup();
                this.console.log(`Loaded ${s.files.size} files in store ${n}.`);
            });
        }));
        await super.login(this.config.token);
        this.console.log(`Completed logon in ${stopwatch.stop()}ms.`);
    }

}

module.exports = ChatNoirClient;
