const { nodes } = require("../../config.json");
const { Client } = require("klasa"); // eslint-disable-line
const NodeStore = require("./NodeStore.js");
const AudioPlayer = require("./AudioPlayer.js"); // eslint-disable-line
const AudioNode = require("./AudioNode.js"); // eslint-disable-line
const { get } = require("snekfetch");

/**
 * A custom LavaLink implementation for the bot.
 * @extends {Collection<string, AudioPlayer>}
 */
class AudioManager extends Collection {

    constructor(client) {
        super();

        /**
         * The KlasaClient Used
         * @type {Client}
         */
        Object.defineProperty(this, "client", { value: client, writable: false });

        this.nodes = new NodeStore();
        this.launchNodes();
    }

    /**
     * Creates all of the nodes and registers
     * all of the event listeners
     * for the nodes.
     */
    launchNodes() {
        for (const node of nodes) {
            // Create the node
            const tempNode = new AudioNode(this);
            tempNode.create(node);
            this.nodes.set(tempNode.host, tempNode);
        }
    }

    /**
     * Makes the bot join a voice channel.
     * @param {string} data - An object containing values for the bot to join a voice channel.
     * @param {string} data.guildId - The guild that owns voice channel.
     * @param {string} data.channelId - The voice channel in the guild.
     * @param {boolean} [data.self_deafened] - Determines if the bot will be deafened when the bot joins the channel.
     * @param {boolean} [data.self_muted] - Determines if the bot will be muted when the bot joins the channel.
     * @param {boolean} data.host - The host of the AudioNode.
     * @returns {AudioPlayer} The new AudioPlayer
     */
    join(data) {
        this.client.ws.send({
            op: 4,
            d: {
                guild_id: data.guildId,
                channel_id: data.channelId,
                self_deaf: data.self_deafened || false,
                self_mute: data.self_muted || false
            }
        });
        const node = this.nodes.get(data.host);
        if (!node) throw new Error(`No node with host: ${data.host} found.`);
        return this._newPlayer(data, node);
    }

    /**
     * Makes the bot leave a voice channel.
     * @param {string} id - The guild id to leave the channel.
     */
    leave(id) {
        this.client.ws.send({
            op: 4,
            d: {
                guild_id: id,
                channel_id: null,
                self_deaf: false,
                self_mute: false
            }
        });
    }

    /**
     * Creates a new player or returns an old player.
     * @param {Object} data - The object containing player data.
     * @param {AudioNode} node - The AudioNode to use.
     * @returns {AudioPlayer}
     * @private
     */
    _newPlayer(data, node) {
        const oldPlayer = this.get(data.guildId);
        if (oldPlayer) return oldPlayer;
        const newPlayer = new AudioPlayer(data, node, this);
        this.set(data.guildId, newPlayer);
        this.client.emit("newPlayer", newPlayer);
        return newPlayer;
    }

};

module.exports = AudioManager;