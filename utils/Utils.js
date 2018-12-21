const { get, post } = require("superagent");
const TicTacToe = require("./games/TicTacToe.js");
const Uno = require("./games/uno/Uno.js");
const basic = (id, secret) => `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;

class Utils {

    constructor(client) {
        this.client = client;
    }
    
    get color() {
        return 0x1A1210;
    }

    async getSpotifyToken() {
        return post("https://accounts.spotify.com/api/token")
            .send({ grant_type: "client_credentials" })
            .set("Authorization", basic(this.client.config.spotify.id, this.client.config.spotify.secret))
            .set("Content-Type", "application/x-www-form-urlencoded")
            .then(res => res.body.access_token)
            .catch(error => {
                this.client.console.error(error);
                return null;
            });
    }

    formatMS(ms) {
        let time = "";
        let seconds = Math.floor(ms);
        const days = Math.floor(seconds / (3600 * 24));
        seconds -= days * 3600 * 24;
        const hrs = Math.floor(seconds / 3600);
        seconds -= hrs * 3600;
        const minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
    
        if (days > 0) {
            if (days > 1) {
                time += `${days} days, `;
            } else {
                time += `${days} day, `;
            }
        } else { time += ""; }
    
        if (hrs > 0) {
            if (hrs > 1) {
                time += `${hrs} hours, `;
            } else {
                time += `${hrs} hour, `;
            }
        } else { time += ""; }
    
        if (minutes > 0) {
            if (minutes > 1) {
                time += `${minutes} minutes, and `;
            } else {
                time += `${minutes} minute, and `;
            }
        } else { time += ""; }
    
        if (seconds > 1) {
            time += `${seconds} seconds`;
        } else {
            time += `${seconds} second`;
        }
    
        return time;
    }

    toNow(ms) {
        const time = Math.abs((new Date()) - (new Date(ms))) / 1000;
        return this.formatMS(time);
    }

    async getTracks(search, host) {
        const node = this.client.audioManager.nodes.get(host);
        if (!node) throw new Error(`The requested node with host ${host} was not found.`);
        return get(`http://${node.host}:2333/loadtracks?identifier=${search}`)
            .set("Authorization", node.password)
            .then(res => {
                if (Array.isArray(res.body)) return res.body;
                if (res.body.loadType === "NO_MATCHES" || res.body.loadType === "LOAD_ERROR") return null;
                if (res.body.loadType === "SEARCH_RESULT" || res.body.loadType === "TRACK_LOADED") return res.body.tracks;
                if (res.body.loadType === "PLAYLIST_LOADED") return {
                    name: res.body.playlistInfo.name,
                    tracks: res.body.tracks
                };
                return null;
            })
            .catch(error => {
                this.client.console.error(error);
                return null;
            });
    }

    idiotic(endpoint, params) {
        return get(`https://dev.anidiots.guide/${endpoint}${params}`)
            .set("Authorization", this.client.config.idiotic)
            .then(res => res.body)
            .catch(e => {
                console.error(e);
                return null;
            })
    }

    isVoter(id) {
        return get(`https://discordbots.org/api/bots/${this.client.user.id}/check?userId=${id}`)
            .set("Authorization", this.client.config.dbl)
            .then(res => Boolean(res.body.voter));
    }

    newTTTGame(message) {
        const game = new TicTacToe(message);
        this.client.tttGames.set(message.channel.id, game);
        return game;
    }

    newUnoGame(message) {
        const game = new Uno(message);
        this.client.unoGames.set(message.channel.id, game);
        return game;
    }

    copyObject(object) {
        return Object.assign(Object.create(object), object);
    }

    haste(text, extension = "") {
        return post("https://hasteb.in/documents")
            .send(text)
            .then(res => `https://hasteb.in/${res.body.key}${extension ? extension : ""}`)
            .catch(() => null);
    }

    *methods (object) {
        if (typeof object !== "object") throw new Error(`methods expects an object not ${typeof object}.`);
        const included = [
            "constructor",
            "__defineGetter__",
            "__defineSetter__",
            "hasOwnProperty",
            "__lookupGetter__",
            "__lookupSetter__",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "valueOf",
            "__proto__"
        ];
        while (object = Reflect.getPrototypeOf(object)) {
            let keys = Reflect.ownKeys(object);
            for (const key of keys)
                if (typeof object[key] === "function" && typeof object[k] !== "undefined" && !included.includes(key))
                    yield { name: key, func: object[key] || null }
        }
    }

    dir(obj) {
        if (typeof obj !== "object") throw new Error(`dir expects an object not ${typeof obj}.`);
        const x = Object.getOwnPropertyNames(obj);
        const p = Object.getOwnPropertyNames(obj.prototype ? obj.prototype : {});
        return [...x, ...p];
    }

    // async swapDbs() {
    //     const mongoClient = await require("mongodb").MongoClient.connect(`mongodb://localhost:27017/`, { useNewUrlParser: true });
    //     const db = mongoClient.db("lenny");
    //     const guildDocuments = await db.collection("guilds").find({}).toArray();
    //     const memberDocuments = await db.collection("members").find({}).toArray();
    //     // Swap guild settings
    //     for (const guildDocument of guildDocuments) {
    //         const guild = this.client.guilds.get(guildDocument.id);
    //         if (!guild) continue;
    //         // Welcomes
    //         if (guildDocument.welcome) {
    //             await guild.settings.update([
    //                 ["welcome.enabled", guildDocument.welcome.enabled ? guildDocument.welcome.enabled : false],
    //                 ["welcome.welcomeMessage", guildDocument.welcome.welcomeMessage ? guildDocument.welcome.welcomeMessage : "Hello **{mention}** welcome to **{guild}**!" ],
    //                 ["welcome.leaveMessage", guildDocument.welcome.leaveMessage ? guildDocument.welcome.leaveMessage : "**{username}** has left **{guild}**."],
    //                 ["welcome.welcomeChannel", guildDocument.welcome.welcomeChannel ? guildDocument.welcome.welcomeChannel : null],
    //                 ["welcome.autoRole", guildDocument.welcome.autoRole ? guildDocument.welcome.autoRole : null],
    //             ], guild);
    //             continue;
    //         }
    //         // Logs
    //         if (guildDocument.logs) {
    //             await guild.settings.update([
    //                 ["logs.channel", guildDocument.logs.channel ? guildDocument.logs.channel : null],
    //                 ["logs.guild", guildDocument.logs.guild ? guildDocument.logs.guild : false],
    //                 ["logs.channels", guildDocument.logs.channels ? guildDocument.logs.channels : false],
    //                 ["logs.roles", guildDocument.logs.roles ? guildDocument.logs.roles : false],
    //                 ["logs.nicknames", guildDocument.logs.nicknames ? guildDocument.logs.nicknames : false],
    //                 ["logs.bans", guildDocument.logs.bans ? guildDocument.logs.bans : false],
    //                 ["logs.joins", guildDocument.logs.joins ? guildDocument.logs.joins : false],
    //                 ["logs.leaves", guildDocument.logs.leaves ? guildDocument.logs.leaves : false],
    //                 ["logs.warns", guildDocument.logs.warns ? guildDocument.logs.warns : false],
    //                 ["logs.messages", guildDocument.logs.messages ? guildDocument.logs.messages : false]
    //             ], guild);
    //             continue;
    //         }
    //         // Levels enabled
    //         if (guildDocument.levelsEnabled) {
    //             await guild.settings.update("levelsEnabled", guildDocument.levelsEnabled);
    //             continue;
    //         }
    //         // Tags
    //         if (guildDocument.tags) {
    //             for (const tag of guildDocument.tags) {
    //                 await guild.settings.update("tags", tag, { action: "add" });
    //             }
    //             continue;
    //         }
    //         // Starboard
    //         if (guildDocument.starboard) {
    //             await guild.settings.update([
    //                 ["starboard.limit", guildDocument.starboard.limit ? guildDocument.starboard.limit : 1],
    //                 ["starboard.channel", guildDocument.starboard.channel ? guildDocument.starboard.channel : null]
    //             ], guild);
    //             continue;
    //         }
    //     }
    //     // Swap guild member settings.
    //     for (const memberDocument of memberDocuments) {
    //         const guild = this.client.guilds.find(g => g.id === memberDocument.id.split(".")[0]);
    //         if (!guild) continue;
    //         const member = guild.members.get(memberDocument.id.split(".")[1]);
    //         if (!member) continue;
    //         await member.settings.update("coins", memberDocument.coins);
    //         await member.settings.update("level", memberDocument.level);
    //     }
    // }

    codeBlock(text, language) {
        return `\`\`\`${language}\n${text}\`\`\``;
    }

    isPromise(promise) {
        return promise instanceof Promise || (promise && typeof promise.then === "function" && typeof promise.catch === "function") || false;
    }

    async p0rn(path) {
        return (await get(`https://nekos.life/api/v2/img/${path}`)).body.url;
    }

}

module.exports = Utils;