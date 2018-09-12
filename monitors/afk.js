const { Monitor } = require("klasa");

class AFK extends Monitor {

    constructor(...args) {
        super(...args, {
            name: "afk",
            ignoreOthers: false
        });
    }

    async run(message) {
        if (!message.guild && !message.channel.postable) return; 
        if (message.mentions.users.size) {
            const afkUsers = message.mentions.users.map(u => u.settings.afk && u.settings.afk.isAfk && u.id !== message.author.id);
            if (!afkUsers.size) return;
            return message.send(afkUsers.map(afkUser => message.language.get("MONITOR_AFK_AFK", afkUser)).join("\n"));
        }
    }

}

module.exports = AFK;