const { Monitor } = require("klasa");

class Level extends Monitor {

    constructor(...args) {
        super(...args, {
            name: "level",
            ignoreSelf: true,
            ignoreBots: true,
            ignoreOthers: false,
            ignoreEdits: true,
            ignoreBlacklistedGuilds: true,
            ignoreBlacklistedUsers: true
        });
        this.memberTimeouts = new Set();
    }

    async run(message) {
        if (!message.guild || message.command) return;
        if (this.memberTimeouts.has(message.author.id)) return;
        const coins = Math.floor(Math.random() * 2) + 5;
        await message.member.setCoins(coins);
        const level = Math.floor(0.1 * Math.sqrt(message.member.settings.coins));
        if (message.member.settings.level < level) {
            if (message.guild.settings.levelsEnabled && message.channel.postable) await message.send(`Hey ${message.member.displayName}, You are now level \`${level}\`.`);
            await message.member.setLevel(level);
        }
        this.memberTimeouts.add(message.author.id);
        setTimeout(() => this.memberTimeouts.delete(message.author.id), 5000);
    }

}

module.exports = Level;