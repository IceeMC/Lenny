const CommandUsage = require("./commandUsage/CommandUsage.js");

class Command {

    constructor(client, storeName, {
        name = null,
        description = "",
        runIn = ["text", "dm"],
        perms = [],
        aliases = [],
        usage = "",
        check = 0,
        cooldown = 0,
        noHelp = false,
        disabled = false,
        extendedHelp = "No extra help.",
        subCommands = []
    }) {
        this.client = client;
        this.store = this.client.storeManager.getStore(storeName);
        this.name = name;
        this.description = description;
        this.aliases = aliases;
        if (aliases.length > 0) aliases.map(a => this.store.aliases.set(a, this));
        this.runIn = runIn;
        this.perms = perms;
        this.check = check;
        this.cooldown = (cooldown * 1000) || 0;
        this.noHelp = noHelp;
        this.disabled = disabled;
        this.path = null;
        this.extendedHelp = extendedHelp;
        this._category = null;
        this.usage = new CommandUsage(this, usage);
        this.subCommands = subCommands;
    }

    get category() {
        if (!this._category) return this.store._getCmdCategory(this.path);
        return this._category;
    }

    // A shortcut for command.key = value;
    def(...props) { props.map(p => this[p.k] = p.v); }

    toJSON() {
        return {
            name: this.name,
            description: typeof this.description === "function" ? this.description(this.message.language) : this.description,
            args: this.message.args || [],
            flags: this.message.flags || {},
        }
    }

}

module.exports = Command;