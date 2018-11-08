const { Command } = require("klasa");
const { Canvas } = require("canvas-constructor");
const fs = require("fs");
const { get } = require("superagent");
const { MessageAttachment } = require("discord.js");

class Profile extends Command {

    constructor(...args) {
        super(...args, {
            name: "profile",
            runIn: ["text"],
            description: language => language.get("COMMAND_DAILY_DESCRIPTION"),
            usage: "[member:membername]",
            aliases: ["myprofile"]
        });
    }

    async run(message, [member]) {
        if (!member) member = message.member;
        const profile = await this.generateProfile(member);
        return message.channel.send(new MessageAttachment(Buffer.from(profile.data)));
    }

    async generateProfile(member) {
        const { settings: { coins, level }, user: { settings: { theme } } } = member; // Deconstruct the members coins, level, and theme
        // Thanks York#0001
        const previousLevel = Math.floor((level / 0.1) ** 2);
        const nextLevel = Math.floor(((level + 1) / 0.1) ** 2);
        const progress = Math.round(((coins - previousLevel) / (nextLevel - previousLevel)) * 394);
        
        return await this.client.utils.idiotic("profile/card", `?name=${member.user.username}&points=${coins}&avatar=${member.user.displayAvatarURL({ format: "png" })}&theme=${theme}&level=${level}&expbar=${progress}&remaining=${progress}`.trim());
    }

}

module.exports = Profile;