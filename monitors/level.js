const { Monitor, RateLimitManager } = require("klasa");

class Level extends Monitor {

    constructor(...args) {
        super(...args, { ignoreOthers: false });
        this.ratelimits = new RateLimitManager(1, 5000);
    }

    async run(message) {
        if (!message.guild || !message.member || message.command) return;
        try {
            this.ratelimits.acquire(message.author.id).drip();
        } catch(err) {
            // They are ratelimited
            return;
        }
        const coins = Math.floor(Math.random() * 2) + 5;
        await message.member.setCoins(coins);
        const level = Math.floor(0.1 * Math.sqrt(message.member.settings.coins));
        if (message.member.settings.level < level) {
            if (message.guild.settings.levelsEnabled && message.channel.postable) await message.send(`Hey ${message.member.displayName}, You are now level \`${level}\`.`);
            await message.member.setLevel(level);
        }
    }

}

module.exports = Level;
