const { Event } = require("klasa");
const AudioManager = require("../utils/music/AudioManager.js");
const Website = require("../utils/Website.js");

class KlasaReady extends Event {

    async run() {
        this.client.user.setActivity(`${this.client.guilds.size} guilds! | r.help | v2`, { type: "WATCHING" });
        this.client.audioManager = new AudioManager(this.client);
        this.client.website = new Website(this.client);
        this.client.website.start();
        this.client.audioManager.nodes.forEach(n => {
            n.on("ready", () => this.client.console.log(`AudioNode connected with host: ${n.host}`));
            n.on("error", error => this.client.console.error(`AudioNode failed to connect with host: ${n.host}. This node will not be used for audio.`));
        });        
    }

}

module.exports = KlasaReady;