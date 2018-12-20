const Store = require("../Store.js");
const { sep } = require("path");

class CommandStore extends Store {

    constructor(...args) {
        super(...args);
        this.aliases = new Map();
        this.dirs = require("fs").readdirSync("./commands/");
        this.cooldowns = null;
    }

    setup() {
        this.cooldowns = this.client.storeManager.getStore("events").files.get("message").cmdCooldowns;
        [...this.files.values()].map(({ name, cooldown }) => cooldown > 0 ? this.cooldowns.gen(name) : undefined);
    }

    _getCmdCategory(path) {
        for (const dir of this.dirs) {
            for (const pathSplit of path.split(require("path").sep)) {
                if (dir === pathSplit) return dir;
            }
        }
    }

}

module.exports = CommandStore;