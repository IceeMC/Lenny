const UsageTag = require("./UsageTag.js");
const quotedString = /(["'‘“"`]).*?(["'’”"`])((?:\\\1|.)*?)(\1)/g; // Modified | Credit: https://github.com/regexhq/quoted-string-regex
const noQuotedString = /\w+/g;

class CommandUsage {

    constructor(command, usage) {
        Object.defineProperty(this, "client", { value: command.client });
        this.command = command;
        this.usage = usage;
        this.usageTags = [];
        this.prepareTags();
    }

    prepareTag(split) {
        if (typeof split !== "string" && split.opening && split.closing)
            return new UsageTag(this.client, this.command, split);
        let [, opening, name, type, all, min, max, closing] = UsageTag.rgx.exec(split);
        if (!opening && !closing) throw `${split} could not be parsed opening/closing was not found.`;
        min = parseInt(min);
        max = parseInt(max);
        return new UsageTag(this.client, this.command, {
            opening,
            name,
            type,
            all,
            min,
            max,
            closing
        });
    }

    prepareTags() {
        if (!this.usage) return;
        Array.isArray(this.usage) ?
            this.usage.map(s => this.usageTags.push(this.prepareTag(s))) :
            !this.usage.split(" ").length ?
                this.usageTags.push(this.prepareTag(this.usage)) :
                this.usage.split(" ").map(s => this.usageTags.push(this.prepareTag(s)));
    }

    async run(message, index = 0) {
        const argArray = [];
        const copied = this.client.utils.copyObject(message);
        copied.args = this.parseArgs(copied.args.join(" "));
        for (let i = (index || 0); i < this.usageTags.length; i++) {
            const usageTag = this.usageTags[i];
            if (!usageTag.required && !usageTag.all && !copied.args[i]) {
                argArray.push(undefined);
                break;
            } else {
                const arg = this.usageTags.length < 2 && usageTag.all ?
                    copied.args.slice(i).join(" ") :
                    copied.args[i];
                const result = await usageTag.run(message, arg);
                argArray.push(result);
                continue;
            }
        }
        return argArray;
    }

    // https://github.com/dirigeants/klasa/blob/stable/src/lib/structures/CommandMessage.js#L201
    parseArgs(content) {
        const args = [];
        let parsed = "";
        let quotedOpened = false;

        for (let i = 0; i < content.length; i++) {
            if (!quotedOpened && content.slice(i, i + 1) === " ") {
                if (parsed !== "") args.push(parsed);
                parsed = "";
                continue;
            }
            if (content[i] === "\"" && content[i - 1] !== "\\") {
                quotedOpened = !quotedOpened;
                if (parsed !== "") args.push(parsed);
                parsed = "";
                continue;
            }
            parsed += content[i];
        }
        if (parsed !== "") args.push(parsed);
        return args;
    }

    get helpString() {
        let str = this.command.aliases.length > 0 ? `❰${[this.command.name, ...this.command.aliases].join("|")}❱` : "";
        str += this.command.subCommands.length > 1 ? `<${this.command.subCommands.join("|")}>` : "";
        str += this.usageTags.map(t => !["type", "subCmd"].includes(t.name) ? t.helpFmt : "").join(" ");
        return str;
    }

}

module.exports = CommandUsage;