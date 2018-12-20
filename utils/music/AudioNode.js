const { EventEmitter } = require("events");
const AudioManager = require("./AudioManager.js"); // eslint-disable-line
const WebSocket = require("ws");

class AudioNode extends EventEmitter {

    /**
     * Returns an AudioNode for the AudioManager.
     * @param {manager} manager - The AudioManager used for making nodes, players, etc.
     * @param {data} 
     */
    constructor(manager, data) {
        /**
         * Create the EventEmitter.
         */
        super();

        /**
         * Is the node ready?
         * @returns {Boolean}
         */
        this.ready = false;

        /**
         * The nodes stats.
         */
        this.stats = null;

        /* WebSocket, AudioManger, and the an object */

        Object.defineProperty(this, "ws", { value: null, writable: true })
        Object.defineProperty(this, "manager", { value: manager, writable: false });
        Object.defineProperty(this, "nodeObj", { value: data, writable: true });

        this._create(this.nodeObj);
    }

    /**
     * Returns an authorization header for the AudioNode.
     * @param {AudioNode} node - The node object containing the node's information.
     * @returns {any}
     */
    nodeHeader(node) {
        return {
            Authorization: node.password,
            "Num-Shards": this.manager.client.shard ? this.manager.client.shard.id : 1,
            "User-Id": this.manager.client.user.id
        };
    }

    /**
     * Creates the node with the given Object.
     * @param {Object} NodeObj - The nodes host, port and, other node info.
     */
    _create(NodeObj) {
        this.host = NodeObj.host;
        this.port = NodeObj.port;
        this.password = NodeObj.password;
        this.ws = new WebSocket(`ws://${NodeObj.host}:${NodeObj.port}`, { headers: this.nodeHeader(NodeObj) });
        this.ws.on("open", this._ready.bind(this, NodeObj));
        this.ws.on("message", this._message.bind(this));
        this.ws.on("close", this._close.bind(this));
        this.ws.on("error", this._error.bind(this));
    }

    /**
     * Emitted when the WebSocket receives an ready event.
     * @param {Object} obj - The NodeObject to set.
     * @private
     */
    _ready(obj) {
        this.ready = true;
        this.emit("ready");
        this.nodeObj = obj;
    }

    /**
     * Emitted when the WebSocket receives an message event.
     * @param {Object} msg - The message object the node sent.
     * @private
     */
    _message(msg) {
        const resp = JSON.parse(msg);
        this.emit("message", resp);
        switch (resp.op) {
        case "playerUpdate": {
            const player = this.manager.get(resp.guildId);
            if (!player) return;
            const { position, time } = resp.state;
            player.emit("update", { position, time });
            player.playerState.currentTimestamp = time;
            player.playerState.currentPosition = position;
            break;
        }
        case "stats": {
            this.stats = resp;
            break;
        }
        case "event": {
            const player = this.manager.get(resp.guildId);
            if (!player) return;
            switch (resp.type) {
            case "TrackEndEvent": {
                if (resp.reason === "STOPPED" || resp.reason === "FINISHED") player.playing = false;
                player.emit("end", { track: resp.track, reason: resp.reason });
                break;
            }
            case "TrackStuckEvent": {
                player.emit("stuck", { track: resp.track, stuckAt: resp.thresholdMs });
                break;
            }
            case "TrackExceptionEvent": {
                player.emit("error", { track: resp.track, error: resp.error });
                break;
            }
            default: { player.emit("unknown", { event: resp.type }); }
            }
        }
        }
    }

    /**
     * Emitted when the WebSocket receives an close event.
     * @param {number} code - The code for why the WebSocket was closed.
     * @param {string | null} reason - The reason for why the WebSocket was closed and it can return null too.
     * @private
     */
    _close(code, reason) {
        reason = reason ? "No reason provided." : reason;
        if (code === 1000) {
            this.emit("close", `Connection the node closed for: ${reason}`);
        } else {
            this.emit("close", `Connection the node closed unexpectedly for: ${reason}`);
        }
    }

    /**
     * Emitted when the WebSocket receives an error event.
     * @param {string} error - The error the WebSocket received.
     * @private
     */
    _error(error) {
        this.emit("error", error);
    }

    /**
     * Sends some JSON Object to the WebSocket.
     * @param {Object} object - The JSON Object to send.
     */
    sendToWS(object) {
        object = JSON.stringify(object);
        this.ws.send(object);
    }

    toJSON() {
        return {
            ready: this.ready,
            stats: this.stats,
            ws: {
                state: this.ws.readyState,
                url: this.ws.url
            }
        };
    }

};

module.exports = AudioNode;