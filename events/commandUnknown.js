const { Event } = require("klasa");

class CommandUnknown extends Event {
    
    async run(message, command, len) {
        const args = message.content.slice(len).split(/\s+/g).slice(1) // Slice off prefix split with a space and slice the command name
        this.client.commands.get("tag").get2(message, command.toLowerCase(), args).catch(() => null); // Send the tag
    }

}

module.exports = CommandUnknown;