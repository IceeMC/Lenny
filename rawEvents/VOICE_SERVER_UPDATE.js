const RawEvent = require("../utils/RawEvent.js");

class VoiceServerUpdate extends RawEvent {

    async run(packet) {
        const player = this.client.audioManager.get(packet.guild_id);
        if (!player) return;
        player.provideVoiceUpdate(packet);
    }

}

module.exports = VoiceServerUpdate;