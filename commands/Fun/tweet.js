const { MessageAttachment } = require("discord.js");
const Command = require("../../framework/Command.js");

class Tweet extends Command {

    constructor(...args) {
        super(...args, {
            name: "tweet",
            description: language => language.get("COMMAND_TWEET_DESCRIPTION"),
            aliases: ["trumptweet"],
            usage: "<text:string::all>"
        });
    }

    async run(message, [text]) {
        const file = await this.client.bananapi.trumptweet(this.client.clean(message, text));
        if (!file) throw message.language.get("BANANAPI_ERROR", "Please shorten the text to 240 characters or less!");
        return message.send(new MessageAttachment(file, "tweet.png"));
    }

}

module.exports = Tweet;