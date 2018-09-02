const { Monitor } = require("klasa");

class AFK extends Monitor {

    constructor(...args) {
        super(...args, {
            name: "afk",
            ignoreBots: true,
            ignoreOthers: false
        });
    }

    async run(message) {
        if (!message.guild && !message.channel.postable) return; 
    
        if (message.mentions.users.size) {
            const firstUser = message.mentions.users.first();
            const { afk, message } = firstUser.settings;
            if (afk) return message.send(`**${firstUser.tag}** has gone afk:  \`${message}\``);
        }
    }

}

module.exports = AFK;