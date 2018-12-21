const Command = require("../../framework/Command.js");
const ClassType = require("../../framework/ClassType.js");
const Stopwatch = require("../../framework/Stopwatch.js");
const { MessageAttachment } = require("discord.js");
const { inspect } = require("util");

class EvalCommand extends Command {

    constructor(...args) {
        super(...args, {
            description: "Evaluates code.",
            runIn: ["text"],
            aliases: ["ev"],
            check: 10,
            noHelp: true,
            usage: "<code:string::all>",
            quotes: false // Disable quoted strings
        });
    }
    
    async run(message, [code]) {
        let { res, file, silent, error, evaledType, times } = await this.evaluateCode(message, code);
        if (file || silent) return;
        message.send(`
Evaluation ${error ? "error" : "success"}:
${this.client.utils.codeBlock(res, "prolog")}

Type:
${this.client.utils.codeBlock(evaledType, "prolog")}

Time taken:
${this.formatTime(...times)}`, { split: true });
    }

    async evaluateCode(message, code) {
        if (message.flags.async) code = `(async () => {\n${code}\n})();`;
        const stopwatch = (new Stopwatch(2)).start();
        let res, error, file = false, evaledType, asyncEvalTime, syncEvalTime;
        try {
            res = eval(code);
            res = typeof res === "string" ? this.client.clean(message, res) : res;
            syncEvalTime = stopwatch.stop();
            evaledType = new ClassType(res).toString();
            if (this.client.utils.isPromise(res)) {
                stopwatch.restart();
                res = await res;
                res = typeof res === "string" ? this.client.clean(message, res) : res;
                asyncEvalTime = stopwatch.stop();
            }
        } catch (err) {
            evaledType = new ClassType(err).toString();
            res = this.client.clean(message, err && err.stack ? err.stack : err === null ? "null" : err.toString());
            error = true;
            syncEvalTime = stopwatch.stop();
        }
        switch (message.flags.output) {
            case "haste":
            case "hastebin": {
                res = await this.client.utils.haste(this.client.clean(message, inspect(res, {
                    depth: message.flags.depth || 0,
                    showHidden: message.flags.hidden || false
                }))).catch(() => "https://hastebin.com/hastebinisfuckingdownreee");
                break;
            }
            case "file": {
                res = await message.channel.send(
                    new MessageAttachment(Buffer.from(this.client.clean(message, inspect(res, {
                        depth: message.flags.depth || 0,
                        showHidden: message.flags.hidden || false
                    }))), "eval.txt")
                );
                file = true;
                break;
            }
        }
        if (typeof res !== "string")
            res = this.client.clean(message, inspect(res, {
                depth: message.flags.depth || 0,
                showHidden: message.flags.hidden || false
            }));
        return {
            res,
            silent: "silent" in message.flags,
            file,
            error,
            evaledType,
            times: [asyncEvalTime, syncEvalTime]
        };
    }

    formatTime(asyncEvalTime, syncEvalTime) {
        return asyncEvalTime ? `:alarm_clock: ${syncEvalTime}[${asyncEvalTime}]`: `:alarm_clock: ${syncEvalTime}`;
    }

}

module.exports = EvalCommand;
