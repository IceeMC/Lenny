const Command = require("../../framework/Command.js");

class Mimic extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_MIMIC_DESCRIPTION"),
            usage: "<user:user> <text:string::all>",
            perms: ["MANAGE_WEBHOOKS"],
            check: 5
        });
    }

    async run(message, [user, text]) {
        await message.delete().catch(() => null);
        const hook = await message.channel.createWebhook(user.username, {
            avatar: user.displayAvatarURL({ format: "png", size: 2048 })
        });
        await hook.send(this.client.clean(message, text));
        await hook.delete();
    }

}

module.exports = Mimic;