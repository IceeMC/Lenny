const { Command } = require("klasa");
const fs = require("fs");
const superagent = require("superagent");

class DownloadEmojis extends Command {

    constructor(...args) {
        super(...args, {
            name: "emojis",
            aliases: ["downloademojis", "getemojis", "stealemojis"],
            description: "Downloads the guild emojis.",
            guarded: true,
            permissionLevel: 10
        });
    }

    async run(message) {
        await message.send("Downloading...");
        const emojis = message.guild.emojis.map(e => ({ name: e.name, id: e.id, url: e.url, ext: `.${e.url.match(/\.(png|gif)/)[1]}` }));
        let successes = 0, errors = 0;
        for (const emoji of emojis) {
            const path = `${process.cwd()}/emojis/${emoji.name}-${emoji.id}${emoji.ext}`;
            try {
                await new Promise(async (resolve, reject) => {
                    const writeStream = (await superagent.get(emoji.url)).pipe(fs.createWriteStream(path));
                    writeStream.on("error", reject);
                    writeStream.on("close", () => {
                        successes++;
                        resolve();
                    });
                });
            } catch (e) {
                errors++;
            }
        }
        return message.send(`Downloaded ${successes}/${emojis.length} emojis with ${errors > 0 ? errors : "no"} errors`);
    }

}

module.exports = DownloadEmojis;