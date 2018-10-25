const { Command } = require("klasa");

class JSIfy extends Command {

    constructor(...args) {
        super(...args, {
            name: "jsify",
            description: language => language.get("COMMAND_JSIFY_DESCRIPTION"),
            usasge: "<text:string>"
        });
    }

    async run(message, [text]) {
        const { js } = await this.client.bananapi.jsify({ text });
        message.send(js);
    }

}

module.exports = JSIfy;