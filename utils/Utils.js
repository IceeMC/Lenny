const { get, post } = require("superagent");
const TicTacToe = require("./TicTacToe.js");

class Utils {

    constructor(client) {
        this.client = client;
    }
    
    get color() {
        return 0xE84536;
    }


    /**
     * Gets tracks from the lavalink REST server.
     * @param {string} search The song to search for.
     * @param {AudioNode} node The node to execute the search on.
     * @returns {Promise<Object>}
     */
    async getTracks(search, node) {
        return get(`http://${node.host}:2333/loadtracks?identifier=${search}`)
            .set("Authorization", node.password)
            .then(res => {
                if (res.body.loadType === "NO_MATCHES" || res.body.loadType === "LOAD_ERROR") return null;
                if (res.body.loadType === "SEARCH_RESULT" || res.body.loadType === "TRACK_LOADED") return res.body.tracks;
                if (res.body.loadType === "PLAYLIST_LOADED") return {
                    name: res.body.playlistInfo.name,
                    tracks: res.body.tracks
                };
            })
            .catch(error => { this.client.console.error(error); return null; });
    }

    /**
     * Gets a endpoint from the idiotic api.
     * @param {string} endpoint The endpoint to request from.
     * @param {string} params The params for the request.
     * @returns {any}
     */
    idiotic(endpoint, params) {
        return get(`https://dev.anidiots.guide/${endpoint}${params}`)
            .set("Authorization", this.client.config.idiotic)
            .then(res => res.body)
            .catch(e => {
                console.error(e);
                return null;
            })
    }

    /**
     * Checks if a user has voted for the bot on DBL.
     * @param {string} id The id to check.
     * @returns {Boolean}
     */
    isVoter(id) {
        return get(`https://discordbots.org/api/bots/${this.client.user.id}/check?userid=${id}`)
            .set("Authorization", this.client.config.dbl)
            .then(res => Boolean(res.body.voter));
    }

    /**
     * Creates instance TicTacToe game for a channel.
     * @param {KlasaMessage} message The message.
     * @returns {TicTacToe}
     */
    newTTTGame(message) {
        const game = new TicTacToe(message);
        this.client.tttGames.set(message.channel.id, game);
        return game;
    }

    /**
     * Returns a perfect copy of the provided object.
     * @param {any} object The object to copy.
     * @returns {any}
     */
    copyObject(object) {
        return Object.assign(Object.create(object), object);
    }

    /**
     * Hastes the provided text to hastebin.
     * @param {string} text The text to haste
     * @param {string} [extension] The hastebin extension
     */
    haste(text, extension = "") {
        return post("https://hastebin.com/documents")
            .send(text)
            .then(res => `https://hastebin.com/${res.body.key}${extension ? extension : ""}`)
            .catch(() => null);
    }

    /**
     * Returns an Iterator of the methods in a class/object.
     * @param {Object} object The class/object to get the methods from.
     * @returns {IterableIterator<{name: string, func: Function}>}
     */
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
                if (typeof object[key] === "function" && !included.includes(key))
                    yield { name: key, func: object[key] ? object[key] : null }
        }
    }

    /**
     * Gets all the property names of the provided object/class;
     * @returns {Array<string>}
     */
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

}

module.exports = Utils;