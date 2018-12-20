class UsageTag {
    constructor(client, command, {
        opening,
        name,
        type,
        all,
        min,
        max,
        closing
    }) {
        Object.defineProperty(this, "client", { value: client });
        this.command = command;
        this.opening = opening;
        this.name = name;
        this.type = type;
        this.all = all === "all";
        this.min = min;
        this.max = max;
        this.closing = closing;
        this.required = opening === "<" && closing === ">";
    }

    getType(type) {
        const store = this.client.storeManager.getStore("args");
        return store.files.get(type) || store.aliases.get(type);
    }

    get usageTags() {
        return this.command.usage.usageTags;
    }

    getSubCommand(arg) {
        const valid = this.command.subCommands.includes(arg) && ["type", "subCmd"].includes(this.name) && !this.type;
        const bad = !this.command.subCommands.includes(arg) && !["type", "subCmd"].includes(this.name) && this.type;
        return { valid, bad };
    }

    async run(message, arg) {
        // Sub command check
        const { valid, bad } = this.getSubCommand(arg);
        if (valid && this.command.subCommands.length > 1) return arg;
        if (!bad) throw message.language.get("SUB_COMMAND_INVALID", this.command.subCommands);
        if (!arg && this.required) throw message.language.get("TAG_ARG_REQUIRED", this);
        // Get type
        const types = ["number", "string"];
        // Set arg
        if (!this.getType(this.type)) throw `${this.type} does not exist!`;
        arg = await this.getType(this.type).run(message, arg);
        // Check min
        if (this.min !== NaN && types.includes((typeof arg))) {
            const type = typeof arg;
            if (type === "number" && arg < this.min) throw message.language.get("TAG_BAD_LENGTH", this);
            if (type === "string" && arg.length < this.min) throw message.language.get("TAG_BAD_LENGTH", this);
        }
        // Check max
        if (this.max !== NaN && types.includes((typeof arg))) {
            const type = typeof arg;
            if (type === "number" && arg > this.max) throw message.language.get("TAG_BAD_LENGTH", this);
            if (type === "string" && arg.length > this.max) throw message.language.get("TAG_BAD_LENGTH", this);
        }
        // Check if both min/max exist
        if (this.min !== NaN && this.min !== NaN && types.includes((typeof arg))) {
            const type = typeof arg;
            if (type === "number" && arg < this.min && arg > this.max)
                throw message.language.get("TAG_BAD_LENGTH", this);
            if (type === "string" && arg.length < this.min && arg.length > this.max)
                throw message.language.get("TAG_BAD_LENGTH", this);
        }
        // Return the parsed arg
        return arg;
    }

    get helpFmt() {
        return `${this.opening}${this.name}${this.closing}`;
    }

}

UsageTag.rgx = /(<|\[)(\w+)(?::(\w+))?(?:::(all))?(?:\[([0-9]+)?,?(?:([0-9]+))?\])?(>|\])/;

module.exports = UsageTag;