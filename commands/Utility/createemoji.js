const Command = require("../../framework/Command.js");
const linkRegex = /https:\/\/cdn\.discordapp\.com\/emojis\/[0-9]{16,18}(\.png|\.gif)/;
const httpRegex = /http[s]?:\/\//;
const imageTypeRegex = /(\.png|\.gif|\.jpe?g|\.webp)/;

function validate(message, arg) {
    if (!arg) throw message.language.get("SUB_COMMAND_INVALID", ["link", "id"]);
    return arg;
}

class CreateEmoji extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_CREATE_EMOJI_DESCRIPTION"),
            aliases: ["addemoji", "aemoji", "cemoji", "createemote"],
            usage: "[linkOrId:string] <name:string>",
            perms: ["MANAGE_EMOJIS"],
            check: 5
        });
    }

    async run(message, [linkOrId, name]) {
        linkOrId = validate(message, linkOrId);
        if (!name) throw "A name must be provided.";
        if (httpRegex.test(linkOrId)) {
            const validType = imageTypeRegex.test(linkOrId);
            if (!validType) throw "The image extension must be png, gif, jpg, jpeg, or webp.";
            const created = await message.guild.emojis.create(linkOrId, name).catch(() => null);
            if (!created) throw "Sorry, an error occurred. Try again later.";
            return message.sendLocale("COMMAND_CREATE_EMOJI_SUCCESS", [created, name]);
        }
        if (linkRegex.test(linkOrId)) {
            const [fullUrl, id] = linkRegex.exec(linkOrId);
            if (message.guild.emojis.has(id)) throw "That emoji already exists. Why would you add it again <:Thonk:356771720863940608>";
            const created = await message.guild.emojis.create(fullUrl, name).catch(() => null);
            if (!created) throw "Sorry, an error occurred. Try again later.";
            return message.sendLocale("COMMAND_CREATE_EMOJI_SUCCESS", [created, name]);
        }
        if (message.guild.emojis.has(linkOrId)) throw "That emoji already exists. Why would you add it again <:Thonk:356771720863940608>?";
        const created = await message.guild.emojis.create(`https://cdn.discordapp.com/emojis/${linkOrId}.png`, name).catch(() => null);
        if (!created) throw "Sorry, an error occurred. Try again later.";
        return message.sendLocale("COMMAND_CREATE_EMOJI_SUCCESS", [created, name]);
    }

}

module.exports = CreateEmoji;