const Event = require("../framework/Event.js");

class UnknownCmd extends Event {

    async run(message, cmd) {
        await this.client.storeManager.getStore("commands").files.get("tag").get2(message, cmd.toLowerCase(), message.args).catch(() => null);
    }

}

module.exports = UnknownCmd;