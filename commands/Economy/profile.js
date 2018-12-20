const Command = require("../../framework/Command.js");
const ArgResolver = require("../../framework/ArgResolver.js");
const { MessageAttachment } = require("discord.js");

class Profile extends Command {

    constructor(...args) {
        super(...args, {
            name: "profile",
            runIn: ["text"],
            description: language => language.get("COMMAND_DAILY_DESCRIPTION"),
            member: "[member:member::all]",
            aliases: ["myprofile"]
        });
    }

    async run(message, [member]) {
        if (!member) member = message.member;
        const profile = await this.generateProfile(member);
        return message.channel.send(new MessageAttachment(Buffer.from(profile.data)));
    }

    async generateProfile(member) {
        const { config: { coins, level }, user: { config: { theme = "blurple" } } } = member; // Deconstruct the members coins, level, and theme
        // Thanks York#0001
        const previousLevel = Math.floor((level / 0.1) ** 2);
        const nextLevel = Math.floor(((level + 1) / 0.1) ** 2);
        const progress = Math.round(((coins - previousLevel) / (nextLevel - previousLevel)) * 394);
        
        return await this.client.utils.idiotic("profile/card", `?name=${member.user.username}&points=${coins}&avatar=${member.user.displayAvatarURL({ format: "png" })}&theme=${theme}&level=${level}&expbar=${progress}&remaining=${progress}`.trim());
    }

}

module.exports = Profile;