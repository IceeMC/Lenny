const Arg = require("../framework/commandUsage/Arg.js");
const idRgx = /^[0-9]{16,18}$/;
const tagRgx = /^.*#[0-9]{4}$/;
const mentionRgx = /^<@!?([0-9]{16,18})>$/;

class MemberArg extends Arg {

    constructor(...args) {
        super(...args, { aliases: ["guildmember"] });
    }

    run(message, arg) {
        console.log(arg);
        const [id] = idRgx.test(arg) ? idRgx.exec(arg) : [null];
        const [tag] = tagRgx.test(arg) ? tagRgx.exec(arg) : [null];
        const [, mention] = mentionRgx.test(arg) ? mentionRgx.exec(arg) : [null, null];
        if (id) {
            const member = message.guild.members.get(id);
            if (!member) throw message.language.get("ARG_BAD_MEMBER");
            return member;
        } else if (tag) {
            const member = message.guild.members.find(m => m.user.tag.toLowerCase() === tag.toLowerCase());
            if (!member) throw message.language.get("ARG_BAD_MEMBER");
            return member;
        } else if (mention) {
            return message.mentions.members.get(mention);
        } else {
            const member = message.guild.members.find(m => m.user.username.toLowerCase() === arg.toLowerCase());
            if (!member) throw message.language.get("ARG_BAD_MEMBER");
            return member;
        }
    }

}

module.exports = MemberArg;
