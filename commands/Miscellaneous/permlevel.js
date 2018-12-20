const Command = require("../../framework/Command.js");

class PermLevel extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_PERM_LEVEL_DESCRIPTION")
        });
        this.levels = {
            0: "User",
            2: "Beta Tester",
            3: "Premium",
            5: "Guild Manager",
            6: "Moderator",
            7: "Administrator",
            8: "Server Owner",
            10: "Bot Owner"
        };
    }

    async run(message) {
        let level = 0;
        const keys =  Object.keys(this.client.permChecks.checks).length;
        for (let i = keys; i >= keys; i--) {
            const { check, value } = await this.client.permChecks.runCheck(i, message);
            console.log(check, value);
            if (!value) continue;
            level = i;
            break;
        }
        return message.sendLocale("COMMAND_PERM_LEVEL", [level, this.levels[level]]);
    }

}

module.exports = PermLevel;