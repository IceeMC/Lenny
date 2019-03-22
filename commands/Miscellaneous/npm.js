const Command = require("../../framework/Command.js");
const https = require("https");

class Npm extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_NPM_DESCRIPTION"),
            runIn: ["text", "dm"],
            usage: "<nick:string::all>",
            check: 6,
            cooldown: 10,
            aliases: ["npmjs", ""]
        });
    }

    getPackage() {
        return new Promise((resolve, reject) => {
            const body = [];
            const request = https.request({
                hostname: "registry.npmjs.org"
            }, response => {
                response.on("data", data => {
                    Buffer.concat([...body, data]);
                });
                response.on("end", () => resolve(JSON.parse(body)));
            });
            request.on("error", error => reject(error));
            request.end();
        });
    }

    async run(message, [package]) {
    }

}

module.exports = Nick;