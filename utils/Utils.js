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
     * @returns {IterableIterator<Map<string, Function>>}
     */
    *getMethods(object) {
        if (typeof object !== "object") throw new Error(`getMethods expects an object not ${typeof object}.`);
        let methods = new Map();
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
            keys.forEach(key => {
                if (typeof object[key] !== null && typeof object[key] === "function" && !included.includes(key)) methods.set(key, object[key]);
            })
        }
        return methods.entries();
    }

}

module.exports = Utils;