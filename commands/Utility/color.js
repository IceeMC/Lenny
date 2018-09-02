const { Command } = require("klasa");
const { MessageAttachment } = require("discord.js");
const { Canvas } = require("canvas-constructor");

class Color extends Command {

    constructor(...args) {
        super(...args, {
            name: "color",
            runIn: ["text"],
            description: language => language.get("COMMAND_COLOR_DESCRIPTION"),
            aliases: ["colour"],
            usage: "<color:color>",
            requiredPermissions: ["ATTACH_FILES", "SEND_MESSAGES"]
        });
    }

    async run(message, [color]) {
        const colorCanvas = new Canvas(200, 100);
        colorCanvas.setColor(`#${color}`);
        colorCanvas.addRect(0, 0, 200, 100);
        const buffer = await colorCanvas.toBufferAsync();
        return message.channel.send(new MessageAttachment(buffer));
    }

}

module.exports = Color;