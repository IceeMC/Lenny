const { Event } = require("klasa");
const AudioManager = require("../utils/music/AudioManager.js");
const Website = require("../website/Website.js");
const { post } = require("superagent");
const { STATUS_CODES } = require("http");

class KlasaReady extends Event {

    async run() {
        this.client.user.setActivity("cn.help | v2", { type: "PLAYING" });
        this.client.audioManager = new AudioManager(this.client);
        this.client.website = new Website(this.client);
        this.client.website.start();
        for (const node of this.client.audioManager) {
            node.on("ready", () => this.client.console.log(`AudioNode connected with host: ${n.host}`));
            node.on("error", error => this.client.console.error(`AudioNode failed to connect with host: ${n.host}. This node will not be used for audio.`));
        }
    }

}

module.exports = KlasaReady;