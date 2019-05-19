const Arg = require("../framework/commandUsage/Arg.js");
const idRgx = /^[0-9]{16,18}$/;
const tagRgx = /^.*#[0-9]{4}$/;
const mentionRgx = /^<@!?([0-9]{16,18})>$/;

class UserArg extends Arg {

    constructor(...args) {
        super(...args, { aliases: ["discorduser"] });
    }

    async run(message, arg) {
        const [id] = idRgx.exec(arg) || [];
        const [tag] = tagRgx.exec(arg) || [];
        const [, mention] = mentionRgx.exec(arg) || [];
        if (id) {
            const user = this.client.users.has(id) ? this.client.users.get(id) : await this.client.users.fetch(id);
            if (!user) throw message.language.get("ARG_BAD_USER");
            return user;
        } else if (tag) {
            const user = this.client.users.some(user => user.tag.toLowerCase().indexOf(tag.toLowerCase()) >= 1) ?
                this.client.users.find(user => user.tag.toLowerCase().indexOf(tag.toLowerCase()) >= 1) :
                null;
            if (!user) throw message.language.get("ARG_BAD_USER");
            return user;
        } else if (mention) {
            return message.mentions.users.get(mention);
        } else {
            const user = this.client.users.find(user => user.username.toLowerCase().indexOf(tag.toLowerCase()) >= 1);
            if (!user) throw message.language.get("ARG_BAD_USER");
            return user;
        };
    }

}

module.exports = UserArg;
