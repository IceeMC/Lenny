const Event = require("../framework/Event.js");

class VoiceServerUpdate extends Event {

    async run({ d }) {
        const player = this.client.audioManager.get(d.guild_id);
        if (!player) return;
        player.provideVoiceUpdate(d);
    }

}

module.exports = VoiceServerUpdate;