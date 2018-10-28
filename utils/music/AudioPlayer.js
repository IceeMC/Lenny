const { EventEmitter } = require("events");
const AudioTrack = require("./AudioTrack.js");
const AudioNode = require("./AudioNode.js"); // eslint-disable-line
const AudioManager = require("./AudioManager"); // eslint-disable-line

module.exports = class AudioPlayer extends EventEmitter {

    /**
     * Creates a new audio player.
     * @param {Object} data - The data from the connectToVoice method.
     * @param {AudioNode} node - The AudioNode used.
     * @param {AudioManager} manager - The AudioManager used.
     */
    constructor(data, node, manager) {
        /**
         * Create the EventEmitter.
         */
        super();

        /**
         * An object returned from the joinVoice method.
         */
        Object.defineProperty(this, "data", { value: data, writable: false });

        /**
         * The AudioNode instance.
         * @type {AudioNode}
         */
        Object.defineProperty(this, "node", { value: node, writable: false });

        /**
         * The AudioManager that was used.
         * @type {AudioManager}
         */
        Object.defineProperty(this, "manager", { value: manager, writable: false });

        /**
         * The current state of the AudioPlayer.
         */
        this.playerState = {
            currentVolume: 100,
            currentTrack: null,
            currentTimestamp: null,
            currentPosition: 0
        };

        /**
         * Whether or not the player is playing or not.
         */
        this.playing = false;

        /**
         * Whether the player is idle (not playing)
         */
        this.idle = false;

        /**
         * The id of the guild
         * @type {String}
         */
        this.guildId = data.guildId;

        /**
         * The queue the of the player.
         * @type {Array}
         */
        this.queue = [];

        /**
         * Wether the player is on loop or not.
         * @type {Boolean}
         */
        this.looping = false;
    }

    /**
     * Plays a song in the voice channel.
     * @param {string} track - The track to play.
     */
    play(track) {
        this.node.sendToWS({
            op: "play",
            guildId: this.guildId,
            track: track
        });
        this.emit("start", track);
        this.playing = true;
        this.playerState.currentTrack = track;
        this.playerState.currentTimestamp = Date.now();
    }

    /**
     * Stops and deletes the current player.
     */
    stop() {
        this.node.sendToWS({
            op: "stop",
            guildId: this.guildId
        });
        this.manager.delete(this.guildId);
    }

    /**
     * Tells the player to pause.
     */
    pause() {
        this.node.sendToWS({
            op: "pause",
            guildId: this.guildId,
            pause: true
        });
        this.emit("pause", true);
        this.playing = false;
    }

    /**
     * Tells the player to resume.
     */
    resume() {
        this.node.sendToWS({
            op: "pause",
            guildId: this.guildId,
            pause: false
        });
        this.emit("pause", false);
        this.playing = true;
    }

    /**
     * Changes the players volume
     * @param {number} volume - The new volume
     */
    setVolume(volume) {
        const oldVolume = this.playerState.currentVolume;
        const newVolume = Math.round(volume);
        this.node.sendToWS({
            op: "volume",
            guildId: this.guildId,
            volume: newVolume
        });
        this.playerState.currentVolume = newVolume;
        this.emit("volume", oldVolume, newVolume);
    }

    /**
     * Tells the player to seek.
     * @param {number} ms - The position to seek too.
     */
    seek(ms) {
        this.node.sendToWS({
            op: "seek",
            guildId: this.guildId,
            position: ms
        });
    }

    /**
     * Adds a track to the queue firing the "queue" event.
     */
    enQueue(track) {
        if (!track instanceof AudioTrack) throw new Error("track must be a AudioTrack instance.");
        this.queue.push(track);
        this.emit("queue", track);
    }

    /**
     * Provides a voice update to the guild.
     * @param {Object} data - The data Object from the VOICE_STATE_UPDATE event.
     */
    provideVoiceUpdate(data) {
        this.node.sendToWS({
            op: "voiceUpdate",
            guildId: this.guildId,
            sessionId: this.manager.client.guilds.get(this.guildId).me.voice.sessionID,
            event: data
        });
    }

};